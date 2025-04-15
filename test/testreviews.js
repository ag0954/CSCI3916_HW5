let envPath = __dirname + "/../.env";
require('dotenv').config({ path: envPath });
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let User = require('../Users');
let Movie = require('../Movies');
let Review = require('../Reviews');
chai.should();

chai.use(chaiHttp);

let login_details = {
    name: 'test2',
    username: 'email2@email.com',
    password: '123@abc'
};

let review_details = {
    movieId: '',
    username: 'email2@gmail.com',
    review: 'great movie - 0e65db9f-40db-4511-bbbe-c484f69e3032',
    rating: 1
};

let token = '';
let movieId = null;

describe('Test Review Routes', () => {
    before(async function() { // Before test: initialize the database to empty
        try {
            await User.deleteOne({ name: 'test2' });
            await Movie.deleteOne({ title: 'Alice in Wonderland' });
            await Review.deleteOne({ review: review_details.review });
        } catch (err) {
            throw err;
        }
    });

    after(async function() { // After this test suite, empty the database
        try {
            await User.deleteOne({ name: 'test2' });
            await Movie.deleteOne({ title: 'Alice in Wonderland' });
            await Review.deleteOne({ review: review_details.review });
        } catch (err) {
            throw err;
        }
    });

    describe('/signup', () => {
        it('it should register, login and check our token', (done) => {
            chai.request(server)
                .post('/signup')
                .send(login_details)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.body.success.should.be.eql(true);
                    // Follow-up to get the JWT token
                    chai.request(server)
                        .post('/signin')
                        .send(login_details)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.have.property('token');
                            token = res.body.token;
                            done();
                        });
                });
        });
    });

    // Test the GET route for movies
    describe('GET Movies', () => {
        it('it returns all movies', (done) => {
            chai.request(server)
                .get('/movies')
                .set('Authorization', token)
                .send()
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an('array');
                    res.body.forEach(movie => {
                        movie.should.have.property('_id');
                        review_details.movieId = movie._id; // assign movieId from the last movie
                        movie.should.have.property('title');
                        movie.should.have.property('releaseDate');
                        movie.should.have.property('genre');
                        movie.should.have.property('actors');
                    });
                    done();
                });
        });
    });

    // Test the Review route
    describe('Review Movies', () => {
        it('it reviews a movie', (done) => {
            chai.request(server)
                .post('/reviews')
                .set('Authorization', token)
                .send(review_details)
                .end((err, res) => {
                    res.should.have.status(201); // Adjusted status to match our API (201 Created)
                    res.body.msg.should.eq('Review created!');
                    done();
                });
        });
    });
});
