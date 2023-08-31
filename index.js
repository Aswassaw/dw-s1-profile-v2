const express = require("express");
const moment = require("moment/moment");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const dateDuration = require("./src/utils/dateDuration");

// sequelize init
const config = require("./config/config.json");
const { Sequelize, QueryTypes } = require("sequelize");
const sequelize = new Sequelize(config.development);

const app = express();
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src/views"));

app.use(express.static(path.join(__dirname, "src/assets")));
app.use(express.urlencoded({ extended: false }));

app.use(flash());
app.use(
  session({
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 2,
    },
    store: new session.MemoryStore(),
    saveUninitialized: true,
    resave: false,
    secret: "GpGO*CG*o3CV*Owc8clIgi8COL",
  })
);

// projects data
let projects = require("./src/data/projects.json");
projects = projects.map((project) => {
  return {
    ...project,
    startDate: moment(project.startDate).format("L"),
    endDate: moment(project.endDate).format("L"),
    createdAt: moment(project.createdAt).format("LLLL"),
    distance: dateDuration(project.startDate, project.endDate),
  };
});

// project
app.get("/", async (req, res) => {
  try {
    const query = `SELECT * FROM projects;`;
    let projectsData = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    projectsData = projectsData.map((project) => {
      return {
        ...project,
        startDate: moment(project.startDate).format("DD/MM/YYYY"),
        endDate: moment(project.endDate).format("DD/MM/YYYY"),
        createdAt: moment(project.createdAt).format("LLLL"),
        updatedAt: moment(project.updatedAt).format("LLLL"),
        distance: dateDuration(project.startDate, project.endDate),
        neverUpdated:
          moment(project.createdAt).unix() === moment(project.updatedAt).unix(),
        isLoggedIn: req.session.isLoggedIn,
      };
    });

    res.render("index", {
      projects: projectsData,
      auth: {
        isLoggedIn: req.session.isLoggedIn,
        idUser: req.session.id,
        name: req.session.name,
      },
    });
  } catch (error) {
    console.log(error);
    res.send("500 Internal Server Error");
  }
});
app.get("/detail-project/:id", async (req, res) => {
  try {
    if (!req.session.isLoggedIn) {
      res.redirect("/login");
      return;
    }

    const query = `SELECT * FROM projects WHERE id=:id;`;
    let projectDetail = await sequelize.query(query, {
      replacements: {
        id: req.params.id,
      },
      type: QueryTypes.SELECT,
    });

    projectDetail = projectDetail.map((project) => ({
      ...project,
      startDate: moment(project.startDate).format("DD/MM/YYYY"),
      endDate: moment(project.endDate).format("DD/MM/YYYY"),
      createdAt: moment(project.createdAt).format("LLLL"),
      updatedAt: moment(project.updatedAt).format("LLLL"),
      distance: dateDuration(project.startDate, project.endDate),
      neverUpdated:
        moment(project.createdAt).format("L") ===
        moment(project.updatedAt).format("L"),
    }));

    res.render("detail-project", {
      project: projectDetail[0],
    });
  } catch (error) {
    console.log(error);
    res.send(`500 Internal Server Error - ${error.message}`);
  }
});
app.get("/add-project", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/login");
    return;
  }

  res.render("add-project");
});
app.post("/add-project", async (req, res) => {
  try {
    const query = `INSERT INTO projects ("projectName", "userId", "startDate", "endDate", description, javascript, golang, php, java, image, "createdAt", "updatedAt") VALUES (:projectName, :userId, :startDate, :endDate, :description, :javascript, :golang, :php, :java, :image, :createdAt, :updatedAt);`;

    await sequelize.query(query, {
      replacements: {
        projectName: req.body.projectName,
        userId: req.session.idUser,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        description: req.body.description,
        javascript: req.body.javascript ? true : false,
        golang: req.body.golang ? true : false,
        php: req.body.php ? true : false,
        java: req.body.java ? true : false,
        image: "https://mardizu.co.id/assets/images/client/default.png",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      type: QueryTypes.INSERT,
    });

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.send("500 Internal Server Error");
  }
});
app.get("/edit-project/:id", async (req, res) => {
  try {
    if (!req.session.isLoggedIn) {
      res.redirect("/login");
      return;
    }

    const query = `SELECT * FROM projects WHERE id=:id;`;
    let projectDetail = await sequelize.query(query, {
      replacements: {
        id: req.params.id,
      },
      type: QueryTypes.SELECT,
    });

    if (projectDetail.length === 0) {
      res.redirect("/");
    }

    projectDetail = projectDetail.map((project) => ({
      ...project,
      startDate: moment(project.startDate).format("YYYY-MM-DD"),
      endDate: moment(project.endDate).format("YYYY-MM-DD"),
      createdAt: moment(project.createdAt).format("LLLL"),
      updatedAt: moment(project.updatedAt).format("LLLL"),
      distance: dateDuration(project.startDate, project.endDate),
      neverUpdated:
        moment(project.createdAt).format("L") ===
        moment(project.updatedAt).format("L"),
    }));

    res.render("edit-project", {
      project: projectDetail[0],
    });
  } catch (error) {
    console.log(error);
    res.send(`500 Internal Server Error - ${error.message}`);
  }
});
app.post("/edit-project/:id", async (req, res) => {
  try {
    const query = `UPDATE projects SET "projectName"=:projectName, "startDate"=:startDate, "endDate"=:endDate, description=:description, javascript=:javascript, golang=:golang, php=:php, java=:java, image=:image, "updatedAt"=:updatedAt WHERE id=:id;`;

    await sequelize.query(query, {
      replacements: {
        id: req.params.id,
        projectName: req.body.projectName,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        description: req.body.description,
        javascript: req.body.javascript ? true : false,
        golang: req.body.golang ? true : false,
        php: req.body.php ? true : false,
        java: req.body.java ? true : false,
        image: "https://mardizu.co.id/assets/images/client/default.png",
        updatedAt: new Date(),
      },
      type: QueryTypes.UPDATE,
    });

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.send(`500 Internal Server Error - ${error.message}`);
  }
});
app.get("/delete-project/:id", async (req, res) => {
  try {
    if (!req.session.isLoggedIn) {
      res.redirect("/login");
      return;
    }

    const query = `DELETE FROM projects WHERE id=:id;`;

    await sequelize.query(query, {
      replacements: {
        id: req.params.id,
      },
      type: QueryTypes.DELETE,
    });

    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.send(`500 Internal Server Error - ${error.message}`);
  }
});
// auth
app.get("/register", (req, res) => {
  if (req.session.isLoggedIn) {
    res.redirect("/");
    return;
  }

  res.render("register", {
    auth: {
      isLoggedIn: req.session.isLoggedIn,
      idUser: req.session.id,
      name: req.session.name,
    },
  });
});
app.post("/register", async (req, res) => {
  try {
    const query = `INSERT INTO users (name, email, password, "createdAt", "updatedAt") VALUES (:name, :email, :password, :createdAt, :updatedAt);`;

    const passwordHashed = await bcrypt.hash(req.body.password, 10);
    await sequelize.query(query, {
      replacements: {
        name: req.body.name,
        email: req.body.email,
        password: passwordHashed,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      type: QueryTypes.INSERT,
    });

    res.redirect("/login");
  } catch (error) {
    console.log(error);
    res.send(`500 Internal Server Error - ${error.message}`);
  }
});
app.get("/login", (req, res) => {
  if (req.session.isLoggedIn) {
    res.redirect("/");
    return;
  }

  res.render("login", {
    auth: {
      isLoggedIn: req.session.isLoggedIn,
      idUser: req.session.id,
      name: req.session.name,
    },
  });
});
app.post("/login", async (req, res) => {
  try {
    const query = `SELECT * FROM users WHERE email=:email`;

    const userSelected = await sequelize.query(query, {
      replacements: {
        email: req.body.email,
      },
      type: QueryTypes.SELECT,
    });

    // jika email belum terdaftar
    if (userSelected.length === 0) {
      req.flash("danger", "Email or Password wrong");
      res.redirect("/login");
      return;
    }

    // cek password
    const match = await bcrypt.compare(
      req.body.password,
      userSelected[0].password
    );

    // jika password salah
    if (!match) {
      req.flash("danger", "Email or Password wrong");
      res.redirect("/login");
      return;
    }

    req.session.idUser = userSelected[0].id;
    req.session.name = userSelected[0].name;
    req.session.isLoggedIn = true;
    req.flash(
      "success",
      `Login success, now logged as ${userSelected[0].name}`
    );
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.send(`500 Internal Server Error - ${error.message}`);
  }
});
app.get("/logout", (req, res) => {
  try {
    req.session.destroy();

    res.redirect("login");
  } catch (error) {
    console.log(error);
    res.send(`500 Internal Server Error - ${error.message}`);
  }
});
// other
app.get("/testimonial", (req, res) => {
  res.render("testimonial", {
    auth: {
      isLoggedIn: req.session.isLoggedIn,
      idUser: req.session.id,
      name: req.session.name,
    },
  });
});
app.get("/contact-me", (req, res) => {
  res.render("contact", {
    auth: {
      isLoggedIn: req.session.isLoggedIn,
      idUser: req.session.id,
      name: req.session.name,
    },
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Url: http://localhost:${PORT}`);
});

// Export the Express API
module.exports = app;
