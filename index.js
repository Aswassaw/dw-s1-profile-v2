const express = require("express");
const moment = require("moment/moment");
const path = require("path");
const dateDuration = require("./src/utils/dateDuration");

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

app.get("/", (req, res) => res.render("index", { projects }));
app.get("/add-project", (req, res) => res.render("add-project"));
app.get("/detail-project/:id", (req, res) => {
  const selectedProject = projects.filter(
    (project) => project.id === req.params.id
  );

  res.render("detail-project", {
    project: selectedProject[0],
  });
});
app.get("/testimonial", (req, res) => res.render("testimonial"));
app.get("/contact-me", (req, res) => res.render("contact"));

app.post("/add-project", (req, res) => {
  console.log(req.body);
  res.redirect("/");
});
app.get("/delete-project/:id", (req, res) => {
  projects = projects.filter((project) => project.id !== req.params.id);

  res.redirect("/");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Url: http://localhost:${PORT}`);
});

// Export the Express API
module.exports = app;
