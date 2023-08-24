const express = require("express");
const app = express();
const PORT = 5000;
const path = require("path");

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "src/views"));

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

// home page
app.get("/", (req, res) => {
  res.render("index");
});
// detail project
app.get("/detail-project/:id", (req, res) => {
  res.render("detail-project");
});
// testimonial page
app.get("/testimonial", (req, res) => {
  res.render("testimonial");
});
// contact page
app.get("/contact-me", (req, res) => {
  res.render("contact");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the Express API
module.exports = app;
