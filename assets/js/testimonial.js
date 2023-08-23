let testimonialData = [];

// fetch data from api
const fetchTestimonial = new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();

  xhr.open("GET", "https://api.npoint.io/a06208748f8723eb6c9b", true);
  xhr.onload = function () {
    if (xhr.status == 200) {
      resolve(JSON.parse(xhr.response));
    } else {
      reject(new Error("Terjadi masalah saat sedang mengambil data!"));
    }
  };
  xhr.onerror = function () {
    reject(new Error("Network Error"));
  };

  xhr.send();
});

// print html element to web on first load
async function allTestimonials() {
  try {
    testimonialData = await fetchTestimonial;

    let testimonialHTML = "";
    testimonialData.forEach(function (item) {
      let starElement = "";
      let filledStar = 0;

      for (let i = 0; i < 5; i++) {
        if (filledStar >= item.rating) {
          starElement += `<i class="fa-regular fa-star"></i>`;
        } else {
          starElement += `<i class="fa-solid fa-star"></i>`;
        }

        filledStar++;
      }

      testimonialHTML += `
      <div class="testimonial-card">
        <div class="rating-value">${starElement}</div>
        <img class="testimonial-image" src="${item.image}" alt="Gambar alt" width="100%">
        <p class="testimonial-message">${item.message}</p>
        <p class="testimonial-author">
          - ${item.author}
        </p>
      </div>`;
    });

    document.getElementById("testimonial").innerHTML = testimonialHTML;
  } catch (error) {
    console.log(error);
    alert(error.message);
  }
}
allTestimonials();

// filter data
async function filterTestimonial(ratingVal) {
  try {
    // select all other rating button
    const allRatingButton = document.querySelectorAll(".rating-list span");

    // remove class active from element
    allRatingButton.forEach((e, index) => {
      if (index === ratingVal) {
        e.classList.add("active");
      } else {
        e.classList.remove("active");
      }
    });

    testimonialData = await fetchTestimonial;
    const testimonialFilter = testimonialData.filter((testi) => {
      if (ratingVal === 0) {
        return true;
      }
      return testi.rating === ratingVal;
    });

    let testimonialHTML = "";
    if (testimonialFilter.length) {
      testimonialFilter.forEach(function (item) {
        let starElement = "";
        let filledStar = 0;

        for (let i = 0; i < 5; i++) {
          if (filledStar >= item.rating) {
            starElement += `<i class="fa-regular fa-star"></i>`;
          } else {
            starElement += `<i class="fa-solid fa-star"></i>`;
          }

          filledStar++;
        }

        testimonialHTML += `
        <div class="testimonial-card">
          <div class="rating-value">${starElement}</div>
          <img class="testimonial-image" src="${item.image}" alt="Gambar alt" width="100%">
          <p class="testimonial-message">${item.message}</p>
          <p class="testimonial-author">
            - ${item.author}
          </p>
        </div>`;
      });
    } else {
      testimonialHTML += `<h1>Data Not Found!</h1>`;
    }

    document.getElementById("testimonial").innerHTML = testimonialHTML;
  } catch (error) {
    console.log(error);
    alert(error.message);
  }
}
