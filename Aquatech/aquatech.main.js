$(document).ready(function () {
  $(".slider").slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: true,
    dots: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  });

  $(window).on("load", function () {
    $("body").addClass("fade-in");
  });

  $("a").on("click", function (e) {
    const target = $(this).attr("href");

    if (target.startsWith("#")) {
      e.preventDefault();
      $("html, body").animate(
        {
          scrollTop: $(target).offset().top - 100,
        },
        600
      );
    } else {
      window.location = target;
    }
  });

  $("#contact-form").submit(function (e) {
    e.preventDefault();
    $("#overlay").show();
    $("#contact-form button").prop("disabled", true).text("Submitting...");

    var formData = {
      name: $("input[name='name']").val(),
      email: $("input[name='email']").val(),
      phone: $("input[name='phone']").val(),
      message: $("textarea[name='message']").val(),
    };

    $.ajax({
      url: "http://localhost:8080/contact/submit",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(formData),
      success: function (response) {
        $(".overlay-content img").hide();
        $(".overlay-content p").text("Form submitted successfully!");
        $(".overlay-content p").css("color", "green");
        setTimeout(function () {
          $("#overlay").fadeOut();
        }, 3000);
        $("#contact-form")[0].reset();
        $("#contact-form button").prop("disabled", false).text("Submit");
      },
      error: function (xhr, status, error) {
        $(".overlay-content img").hide();
        $(".overlay-content p").text("An error occurred. Please try again.");
        $(".overlay-content p").css("color", "red");
        setTimeout(function () {
          $("#overlay").fadeOut();
        }, 3000);
        $("#contact-form button").prop("disabled", false).text("Submit");
      },
    });
  });
});