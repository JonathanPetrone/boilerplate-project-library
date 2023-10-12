const mongoose = require('mongoose');
const db = mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });

// export
module.exports = db;