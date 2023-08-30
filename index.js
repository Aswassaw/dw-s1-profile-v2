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
        startDate: moment(project.startDate).format("L"),
        endDate: moment(project.endDate).format("L"),
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
      startDate: moment(project.startDate).format("L"),
      endDate: moment(project.endDate).format("L"),
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
    res.send("500 Internal Server Error");
  }
});
app.get("/add-project", (req, res) => {
  res.render("add-project");
});
app.post("/add-project", (req, res) => {
  const newProject = {
    id: `${new Date().getTime()}`,
    projectName: req.body.projectName,
    startDate: moment(req.body.startDate).format("L"),
    endDate: moment(req.body.endDate).format("L"),
    distance: dateDuration(req.body.startDate, req.body.endDate),
    description: req.body.description,
    technologies: {
      js: req.body.javascript !== undefined,
      go: req.body.golang !== undefined,
      php: req.body.php !== undefined,
      java: req.body.java !== undefined,
    },
    imageUrl: "https://mardizu.co.id/assets/images/client/default.png",
    createdAt: moment(new Date()).format("LLLL"),
  };
  projects.push(newProject);

  res.redirect("/");
});
app.get("/edit-project/:id", (req, res) => {
  const selectedProject = projects.filter(
    (project) => project.id === req.params.id
  );

  if (selectedProject.length === 0) {
    res.redirect("/");
  }

  res.render("edit-project", {
    project: {
      ...selectedProject[0],
      startDate: moment(new Date(selectedProject[0].startDate)).format(
        "YYYY-MM-DD"
      ),
      endDate: moment(new Date(selectedProject[0].endDate)).format(
        "YYYY-MM-DD"
      ),
    },
  });
});
app.post("/edit-project/:id", (req, res) => {
  const newProject = {
    id: req.params.id,
    projectName: req.body.projectName,
    startDate: moment(req.body.startDate).format("L"),
    endDate: moment(req.body.endDate).format("L"),
    distance: dateDuration(req.body.startDate, req.body.endDate),
    description: req.body.description,
    technologies: {
      js: req.body.javascript !== undefined,
      go: req.body.golang !== undefined,
      php: req.body.php !== undefined,
      java: req.body.java !== undefined,
    },
    imageUrl: "https://mardizu.co.id/assets/images/client/default.png",
    createdAt: moment(new Date()).format("LLLL"),
  };
  // delete project
  projects = projects.filter((project) => project.id !== req.params.id);
  // add project
  projects.push(newProject);

  res.redirect("/");
});
app.get("/delete-project/:id", (req, res) => {
  projects = projects.filter((project) => project.id !== req.params.id);

  res.redirect("/");
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
