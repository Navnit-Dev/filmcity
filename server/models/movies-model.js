const {mongoose,Schema} = require("mongoose")

const movieSchema = Schema({
    title: String,
    year: Number,
    category: [String],
    rating: Number,
    description: String,
    posterUrl: String,
    screenshots: [String],
    downloadLinks: {
        type: Map,
        of: String
    },
    watch: String,
    position: {
        type: String,
        required: false
    },
    sequence: {
        type: Number,
        default: 0
    }
});

// Add index on sequence field for better performance
movieSchema.index({ sequence: 1 });

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie