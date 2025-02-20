const express  = require('express');
const router = express.Router()
const movies = require('../models/movies-model')

//Get All Movies Data (now sorted by sequence)
router.route("/movies").get(async (req,res)=>{
    try {
        const data = await movies.find().sort({ sequence: 1 });
        res.json(data)
    } catch (error) {
        console.log("Server Error !")
        res.status(500).json({ message: "Server Error" });
    }
})

//Add Movie Route (with sequence)
router.route("/movies").post(async (req,res)=>{
    try {
        // Find the highest sequence number
        const lastMovie = await movies.findOne().sort({ sequence: -1 });
        const nextSequence = lastMovie ? lastMovie.sequence + 1 : 1;
        
        const Movie = new movies({
            ...req.body,
            sequence: nextSequence
        });
        const SavedMovie = await Movie.save()
        res.json(SavedMovie)
        console.log(`Movie Added Successfully ${JSON.stringify(SavedMovie)}`)
    } catch (error) {
        res.status(400).json(error)
    }
})

// Update sequences endpoint
router.route('/movies/update-sequences').put(async (req, res) => {
    try {
        const { sequences } = req.body;
        
        // Update each movie's sequence in parallel
        await Promise.all(sequences.map(({ movieId, sequence }) => 
            movies.findByIdAndUpdate(movieId, { sequence })
        ));
        
        res.json({ message: 'Sequences updated successfully' });
    } catch (error) {
        console.error('Error updating sequences:', error);
        res.status(500).json({ message: 'Failed to update sequences' });
    }
});

//Delete Movie By Id Route (update sequences after delete)
router.route('/movies/:id').delete(async (req,res)=> {
    try {
        const MovieId = req.params.id;
        const deletedMovie = await movies.findById(MovieId);
        
        if(!deletedMovie){
            return res.status(404).json({message:"Movie not Found!"});
        }
        
        // Delete the movie
        await movies.findByIdAndDelete(MovieId);
        
        // Update sequences of remaining movies
        await movies.updateMany(
            { sequence: { $gt: deletedMovie.sequence } },
            { $inc: { sequence: -1 } }
        );
        
        res.json({ message: 'Movie deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
})

//Fillter Movie By Id Route
router.route('/movies/:id').get(async (req,res) => {
    try {
        const MovieId = req.params.id;
        const FoundMovie = await movies.findById(MovieId)

        if(!FoundMovie){
            res.status(400).json({Msg:"Movie not Found With ID"})
        }

        res.json(FoundMovie)
    } catch (error) {
        console.log(error)
    }    
})

//Add ScreenShot Route
router.route('/movies/:id/screenshots').post(async (req,res) => {
    try {
        const Movie = await movies.findById(req.params.id)
        if(!Movie){
            res.status(400).json({Msg:"Movie Not Found"})
        }

        const { url } = req.body;
        if (!Movie.screenshots) {
            Movie.screenshots = [];
        }
        Movie.screenshots.push(url);
        await Movie.save()
        res.json(Movie);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

//Delete ScreenShot Route
router.route('/movies/:id/screenshots').delete(async (req,res) => {
    try {
        const Movie = await movies.findById(req.params.id)
        if(!Movie){
            res.status(400).json({Msg:"Movie Not Found"})
        }

        const { url } = req.body;
        Movie.screenshots = Movie.screenshots.filter(s => s !== url);
        await Movie.save();
        
        res.json(Movie);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

//Add Quality Route
router.route('/movies/:id/quality').post(async (req,res) => {
    try {
        const Movie = await movies.findById(req.params.id);
        if(!Movie){
            return res.status(404).json({msg:"Movie not Found"})
        }

        const {quality,link} = req.body;
        if(!Movie.downloadLinks){
            Movie.downloadLinks = new Map();
        };

        Movie.downloadLinks.set(quality,link);
        await Movie.save();

        res.json(Movie);
    } catch (error) {
        res.status(400).json({msg:error.message })
    }
})

//Delete Quality Route
router.route('/movies/:id/quality/:quality').delete(async (req,res) => {
    try {
        const Movie = await movies.findById(req.params.id);
        if(!Movie){
            return res.status(404).json({msg:"Movie not Found"});
        };

        Movie.downloadLinks.delete(req.params.quality);
        await Movie.save();

        res.json(Movie);
    } catch (error) {
        res.status(400).json({msg:error.message})
    }
})

// All Trending Movies
router.route('/trending').get(async (req,res) => {
    try {
        const data = await movies.find({position:"trending"})
        res.json(data)
    } catch (error) {
        console.log("Server Error !")
    }
});

//Filter Route
router.route('/search').post( async (req,res) => {
  try {
    const Query = req.body;
    const data = await movies.find(Query);
    res.json(data)
  } catch (error) {
    console.log(error)
  }  
})

router.route('/movies/:id').put(async (req,res) => {
    try {
        const movieId = req.params.id;
        const updatedData = req.body;

        const updatedMovie = await movies.findByIdAndUpdate(movieId, updatedData, { new: true });

        if (!updatedMovie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        res.status(200).json(updatedMovie);
    } catch (error) {
        res.status(400).json({ message: `Data Not Updated! ${error}` });
    }
})


module.exports = router;