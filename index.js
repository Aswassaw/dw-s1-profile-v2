const express = require("express");
const moment = require("moment/moment");
const path = require("path");
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
          moment(project.createdAt).format("L") ===
          moment(project.updatedAt).format("L"),
      };
    });

    res.render("index", { projects: projectsData });
  } catch (error) {
    console.log(error);
    res.send("500 Internal Server Error");
  }
});
app.get("/detail-project/:id", async (req, res) => {
  try {
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
  res.render("add-project");
});
app.post("/add-project", async (req, res) => {
  try {
    const query = `INSERT INTO projects (name, "startDate", "endDate", description, javascript, golang, php, java, image, "createdAt", "updatedAt") VALUES (:name, :startDate, :endDate, :description, :javascript, :golang, :php, :java, :image, :createdAt, :updatedAt);`;

    await sequelize.query(query, {
      replacements: {
        name: req.body.projectName,
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
    const query = `UPDATE projects SET name=:name, "startDate"=:startDate, "endDate"=:endDate, description=:description, javascript=:javascript, golang=:golang, php=:php, java=:java, image=:image, "updatedAt"=:updatedAt WHERE id=:id;`;

    console.log(req.body);

    await sequelize.query(query, {
      replacements: {
        id: req.params.id,
        name: req.body.projectName,
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
app.get("/testimonial", (req, res) => {
  res.render("testimonial");
});
app.get("/contact-me", (req, res) => {
  res.render("contact");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Url: http://localhost:${PORT}`);
});

// Export the Express API
module.exports = app;
