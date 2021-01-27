const express = require('express');
const Profile = require('../../models/Profile');
const auth = require('../../middleware/auth');
const User = require('../../models/user');
const {
    check,
    validationResult
} = require('express-validator');

const router = express.Router();

// @route    GET api/profile/me  
// @desc     Get current users profile
// @access   Private


router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({
                msg: 'There is no profile for this user'
            });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route    GET api/profile
// @desc     Create or update user profile
// @access   Private

router.post('/', [auth, [
        check('status', 'Status is required').not().isEmpty()
    ], check('skills', 'Skills is required').not().isEmpty()],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(401).json({
                errors: errors.array()
            })
        }

        // destructure the request
        const {
            company,
            location,
            website,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        // Build profile object
        const profileFields = {};
        profileFields.user = req.user.id
        if (company) profileFields.company = company
        if (location) profileFields.location = location
        if (website) profileFields.website = website
        if (status) profileFields.status = status
        if (bio) profileFields.bio = bio
        if (githubusername) profileFields.githubusername = githubusername
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim())
        }
        console.log(profileFields.skills)


        // Build social object
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube
        if (twitter) profileFields.social.twitter = twitter
        if (instagram) profileFields.social.instagram = instagram
        if (linkedin) profileFields.social.linkedin = linkedin
        if (facebook) profileFields.social.facebook = facebook

        try {
            let profile = await Profile.findOne({
                user: req.user.id
            })
            if (profile) {
                // Update
                profile = await Profile.findByIdAndUpdate({
                    user: req.user.id
                }, {
                    $set: profileFields
                }, {
                    new: true
                });
                return res.json(profile);
            }
            // create 
            profile = new Profile(profileFields);
            await profile.save()
            res.json(profile);
        } catch (err) {
            console.error(err.message)
            res.status(500).send('Server error')
        }
    }


);


module.exports = router;