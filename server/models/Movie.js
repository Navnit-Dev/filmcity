const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    posterUrl: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    downloadLinks: {
        type: Object,
        required: true,
        validate: {
            validator: function(v) {
                return v['720p'] && v['1080p'] && v['1440p'];
            },
            message: 'Movie must have 720p, 1080p, and 1440p download links'
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);
