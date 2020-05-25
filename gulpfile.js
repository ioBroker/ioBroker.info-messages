'use strict';

const gulp   = require('gulp');
const Stream = require('stream');
const Client = require('ssh2').Client;

const SFTP_HOST = process.env.SFTP_HOST;
const SFTP_PORT = process.env.SFTP_PORT;
const SFTP_USER = process.env.SFTP_USER;
const SFTP_PASS = process.env.SFTP_PASS;
const DEBUG     = process.env.DEBUG     === 'true' || process.env.DEBUG     === true;
const FAST_TEST = process.env.FAST_TEST === 'true' || process.env.FAST_TEST === true;

const SFTP_CONFIG = {
    host: SFTP_HOST,
    port: parseInt(SFTP_PORT, 10),
    username: SFTP_USER,
    password: SFTP_PASS,
};

function writeSftp(sftp, fileName, data, cb) {
    const readStream = new Stream.PassThrough();

    readStream.end(Buffer.from(data));

    const writeStream = sftp.createWriteStream(fileName);

    writeStream.on('close', () => {
        DEBUG && console.log(`${new Date().toISOString()} ${fileName} - file transferred successfully`);
        readStream.end();
        if (cb) {
            cb();
            cb = null;
        }
    });

    writeStream.on('end', () => {
        DEBUG && console.log('sftp connection closed');
        readStream.close();
        if (cb) {
            cb();
            cb = null;
        }
    });

    // initiate transfer of file
    readStream.pipe(writeStream);
}

function uploadOneFile(fileName, data) {
    return new Promise((resolve, reject) => {
        const conn = new Client();
        conn.on('ready', () =>
            conn.sftp((err, sftp) => {
                if (err) {
                    return reject(err);
                }

                if (FAST_TEST) {
                    console.log('Simulate upload of ' + fileName);
                    return resolve();
                }

                // file must be deleted, because of the new file smaller, the rest of old file will stay.
                checkAndDeleteIfExist(sftp, fileName, () =>
                    writeSftp(sftp, fileName, data, () => {
                        sftp.end();
                        conn.end();
                        resolve();
                    }));
            }))
            .connect(SFTP_CONFIG);
    });
}

function checkAndDeleteIfExist(sftp, fileName, cb) {
    sftp.exists(fileName, doExist => {
        if (doExist) {
            sftp.unlink(fileName, cb);
        } else {
            cb();
        }
    });
}

gulp.task('deploy', () => {
    const news = require('./news.json'); // it will check if the json has valid structure too

    return uploadOneFile('/news.json', JSON.stringify(news));
});