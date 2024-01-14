var BASENAME = '/';
if (process.env.REACT_APP_BASENAME)
    BASENAME = process.env.REACT_APP_BASENAME;

var BACKEND_URL = ``;
if (process.env.REACT_APP_BACKEND_URL)
    BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

exports.module = {BACKEND_URL, BASENAME};