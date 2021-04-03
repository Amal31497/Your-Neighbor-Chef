const router = require('express').Router();
const { Chef,Cuisine,Dish } = require('../../models');

router.get('/',async (req,res)=>{
  try {
    const chefData = await Chef.findAll({
      include:[{
        model:Cuisine,
        include:[Dish]
      }]
  })
    res.status(200).json(chefData)
  } catch (err) {
    res.status(500).json(err)
  }
})


// CREATE new Chef sign up
router.post('/', async (req, res) => {
  try {
    const ChefData = await Chef.create(req.body);

    req.session.save(() => {
      req.session.loggedIn = true;

      res.status(200).json(ChefData);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Login
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
      res
        .status(400)
        .json({ message: 'Incorrect email or password. Please try again!' });
      return;
    }

    req.session.save(() => {
      req.session.loggedIn = true;

      res
        .status(200)
        .json({ user: dbUserData, message: 'You are now logged in!' });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Logout
router.post('/logout', (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;