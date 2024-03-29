const express = require("express");
const moment = require("moment/moment");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const dateDuration = require("./src/utils/dateDuration");
const deleteFile = require("./src/utils/deleteFile");
const uploadMiddleware = require("./src/middlewares/upload");

const BASE_URL = "http://localhost:5000";

// sequelize init
const config = require("./config/config.json");
const { Sequelize, QueryTypes } = require("sequelize");
const sequelize = new Sequelize(config.development);

const app = express();
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src/views"));

app.use(express.static(path.join(__dirname, "src/assets")));
app.use(express.static(path.join(__dirname, "src/uploads")));
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
    let query = "";
    let projectsData = "";
    if (req.session.idUser) {
      query = `SELECT p.id, "projectName", "startDate", "endDate", description, javascript, golang, php, java, image, p."createdAt", p."updatedAt", users.name AS author, users.id AS "idUser" FROM projects p JOIN users ON p."userId" = users.id WHERE p."userId" = :idUser ORDER BY p.id DESC;`;

      projectsData = await sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: {
          idUser: req.session.idUser,
        },
      });
    } else {
      query = `SELECT p.id, "projectName", "startDate", "endDate", description, javascript, golang, php, java, image, p."createdAt", p."updatedAt", users.name AS author, users.id AS "idUser" FROM projects p JOIN users ON p."userId" = users.id ORDER BY p.id DESC;`;

      projectsData = await sequelize.query(query, {
        type: QueryTypes.SELECT,
      });
    }

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
        access: req.session.idUser === project.idUser,
        image: project.image.includes("https")
          ? project.image
          : `${BASE_URL}/${project.image}`,
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

    const query = `SELECT p.id, "projectName", "startDate", "endDate", description, javascript, golang, php, java, image, p."createdAt", p."updatedAt", users.name AS author FROM projects p JOIN users ON p."userId" = users.id WHERE p.id=:id;`;
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
        moment(project.createdAt).unix() === moment(project.updatedAt).unix(),
      image: project.image.includes("https")
        ? project.image
        : `${BASE_URL}/${project.image}`,
    }));

    res.render("detail-project", {
      project: projectDetail[0],
      auth: {
        isLoggedIn: req.session.isLoggedIn,
        idUser: req.session.id,
        name: req.session.name,
      },
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

  res.render("add-project", {
    auth: {
      isLoggedIn: req.session.isLoggedIn,
      idUser: req.session.id,
      name: req.session.name,
    },
  });
});
app.post(
  "/add-project",
  uploadMiddleware.single("projectImage"),
  async (req, res) => {
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
          image:
            req.file?.filename ||
            "https://mardizu.co.id/assets/images/client/default.png",
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
  }
);
app.get("/edit-project/:id", async (req, res) => {
  try {
    if (!req.session.isLoggedIn) {
      res.redirect("/login");
      return;
    }

    const query = `SELECT p.id, "projectName", "startDate", "endDate", description, javascript, golang, php, java, image, p."createdAt", p."updatedAt", users.name AS author, users.id AS "idUser" FROM projects p JOIN users ON p."userId" = users.id WHERE p.id=:id;`;
    let projectDetail = await sequelize.query(query, {
      replacements: {
        id: req.params.id,
      },
      type: QueryTypes.SELECT,
    });

    if (projectDetail.length === 0) {
      req.flash("danger", "Project Not Found!");
      res.redirect("/");
      return;
    }

    if (projectDetail[0].idUser !== req.session.idUser) {
      req.flash(
        "danger",
        "Anda tidak memiliki akses terhadap Project tersebut!"
      );
      res.redirect("/");
      return;
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
      auth: {
        isLoggedIn: req.session.isLoggedIn,
        idUser: req.session.id,
        name: req.session.name,
      },
    });
  } catch (error) {
    console.log(error);
    res.send(`500 Internal Server Error - ${error.message}`);
  }
});
app.post(
  "/edit-project/:id",
  uploadMiddleware.single("projectImage"),
  async (req, res) => {
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
          image:
            req.file?.filename ||
            req.body.previousProjectImage ||
            "https://mardizu.co.id/assets/images/client/default.png",
          updatedAt: new Date(),
        },
        type: QueryTypes.UPDATE,
      });

      // menghapus file jika ada req image baru
      if (req.file?.filename) {
        deleteFile("src/uploads/" + req.body.previousProjectImage);
      }

      res.redirect("/");
    } catch (error) {
      console.log(error);
      res.send(`500 Internal Server Error - ${error.message}`);
    }
  }
);
app.get("/delete-project/:id", async (req, res) => {
  try {
    if (!req.session.isLoggedIn) {
      res.redirect("/login");
      return;
    }

    const queryCheck = `SELECT  p.image, users.id AS "idUser" FROM projects p JOIN users ON p."userId" = users.id WHERE p.id=:id;`;
    let projectDetail = await sequelize.query(queryCheck, {
      replacements: {
        id: req.params.id,
      },
      type: QueryTypes.SELECT,
    });

    if (projectDetail.length === 0) {
      req.flash("danger", "Project Not Found!");
      res.redirect("/");
      return;
    }

    if (projectDetail[0].idUser !== req.session.idUser) {
      req.flash(
        "danger",
        "Anda tidak memiliki akses terhadap Project tersebut!"
      );
      res.redirect("/");
      return;
    }

    const query = `DELETE FROM projects WHERE id=:id;`;
    await sequelize.query(query, {
      replacements: {
        id: req.params.id,
      },
      type: QueryTypes.DELETE,
    });

    // menghapus file jika ada req image baru
    deleteFile("src/uploads/" + projectDetail[0].image);

    req.flash("success", "Project deleted successfully");
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
    // cek apakah user dengan email sudah ada
    const queryCheck = `SELECT * FROM users WHERE email=:email`;
    const userSelected = await sequelize.query(queryCheck, {
      replacements: {
        email: req.body.email,
      },
      type: QueryTypes.SELECT,
    });

    // jika email sudah terdaftar
    if (userSelected.length) {
      req.flash("danger", "Email already registered");
      res.redirect("/register");
      return;
    }

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
