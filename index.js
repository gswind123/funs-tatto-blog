/**
 * Created by yw_sun
 */

const express = require('express');
var app = express();
app.use(express.static('public'));
app.listen(18080);

