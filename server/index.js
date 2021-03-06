require('dotenv').config();
require('newrelic');
const express = require('express');
//const morgan = require('morgan');
//const compression = require('compression');
const controller = require('./controller');
const path = require ('path');

const PUBLIC_DIR = path.resolve(__dirname, '../client/dist');
//const router = require('./routes');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// app.use(morgan('dev'));
// app.use(express.json());
// app.use(compression());

// app.use('/api/rooms/', router);
app.get('/api/rooms/:propertyId/booking/calendar', controller.getCal);
app.get('/api/rooms/:propertyId/booking', controller.getProp)
app.use(express.static(PUBLIC_DIR));

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
