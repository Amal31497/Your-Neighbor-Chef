const express = require('express');
const router = require('express').Router();
const { Chef, Cuisine, Dish, } = require('../../models');
const withAuth = require('../../utils/auth');

const aws = require('aws-sdk');

const multer = require('multer');
const multerS3 = require('multer-s3');
const uuid = require('uuid').v4;
const path = require('path');

const app = express();

const s3 = new aws.S3({ apiVersion: '2006-03-01' });

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'chefimages',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const fileUname = uuid();
      cb(null, `${fileUname}${ext}`);
      const chefID = req.session.user_id;

      console.log(chefID);
      const fullName = fileUname + ext;
      console.log(fullName);

      Chef.update(
        {
          image_name: fullName,
        },
        {
          where: {
            id: chefID,
          }
        })
        .then(
          (updated) => {
            res.json(updated)
          }
        ).catch((err) => {
          res.json(err)
        });
    }

  })
})

router.post('/upload', upload.array('avatar'), (req, res) => {
  return res.json({ status: "OK", uploaded: req.files.length });
});

// const storage = multer.diskStorage({
//   destination: (req, file, cb) =>{
//     cb(null, 'uploads');
//   },
//   filename: (req, file, cb) => {
//     const { originalname} = file;
//     cb(null, `${uuid()}-${originalname}`);
//   }
// });
// const upload = multer({storage});

// router.post('/upload', upload.array('avatar'), (req, res) => {
//   return res.json({ status: 'OK', uploaded: req.files.length});
// });


// GET all Chefs
router.get('/', async (req, res) => {
  try {
    const chefData = await Chef.findAll({
      include: [{
        model: Cuisine,
        include: [Dish]
      }]
    })
    res.status(200).json(chefData)
  } catch (err) {
    res.status(500).json(err)
  }
})

router.get('/:id', async (req, res) => {
  try {
    // Find the logged in user based on the session ID
    const chefData = await Chef.findOne({
      where: {
        id: req.params.id
      },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Cuisine,
          include: [Dish]
        }
      ]
    });
    console.log(chefData)
    res.status(200).json(chefData)

  } catch (err) {
    res.status(500).json(err);
  }
});

// CREATE new Chef sign up
router.post('/', async (req, res) => {
  try {
    const ChefData = await Chef.create(req.body);

    req.session.save(() => {
      req.session.user_id = ChefData.id;
      req.session.logged_in = true;

      res.status(200).json(ChefData);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// UPDATE(PUT) Chef profile info
router.put('/:id', withAuth, async (req, res) => {
  try {
    const chefData = await Chef.update({ chef_description: req.body.chef_description },
      {
        where: {
          id: req.params.id
        }
      });

    if (!chefData[0]) {
      res.status(404).json({ message: 'No chef found with this id!' });
    }

    res.status(200).json(chefData)
  } catch (err) {
    res.status(500).json(err)
  }
})


// POST Chef Login
router.post('/login', async (req, res) => {
  try {
    const dbChefData = await Chef.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!dbChefData) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password. Please try again!' });
      return;
    }

    const validPassword = await dbChefData.checkPassword(req.body.password);

    if (!validPassword) {
      res.status(400).json({ message: 'Incorrect email or password. Please try again!' });
      return;
    }

    req.session.save(() => {
      req.session.user_id = dbChefData.id
      req.session.logged_in = true;
      res.status(200).json(dbChefData);
    });

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// POST Chef Logout
router.post('/logout', withAuth, (req, res) => {
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;
