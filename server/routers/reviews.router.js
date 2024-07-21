import Router from 'express'
import {addReview, deleteReviewByID, getReviews, getReviewsByID} from '../controllers/reviews.controller.js'

const router = Router();
router.get('/reviews',getReviews);
router.post('/addreview',addReview);
router.get('/reviews/:id',getReviewsByID);
router.delete('/deletereviews/:id',deleteReviewByID);



export default router;