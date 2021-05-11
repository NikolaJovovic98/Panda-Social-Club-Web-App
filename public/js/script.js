// $("#follow-button").on("click", (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     const followerId = $("#follow-form").data("userid");
//     const data = {};
//     data.followerId = followerId;
//     $.ajax({
//         type: "POST",
//         url: `/users/follow/${followerId}`,
//         data: JSON.stringify(data),
//         contentType: "application/json",
//         success: (response) => {
//             $('#follow-message').show().html(response.message);
//         },
//         error: () => {
//             alert("Server error occured");
//         }
//     });
// });


/* NAV DROPDOWN */

$(".header-navbar").click(function () {
  $header = $(this);
  $content = $header.next();
  $content.slideToggle({
    start: function () {
      $(this).css({
        display: "flex"
      })
    }
  });
});

/* CHECK COVER PHOTO TYPE */

var _URL = window.URL || window.webkitURL;
$("#cover-input").change(function (e) {
  var file, img;
  if ((file = this.files[0])) {
    img = new Image();
    img.onload = function () {
      if(this.width<this.height){
        alert("Cover you selected is not landscape type.");
      }else{
        alert("Cover is valid");
      }
    };
    img.src = _URL.createObjectURL(file);
  }
});

/* SHOW PEOPLE WHO LIKED POST */

const numOfLikesDiv = document.getElementById("numOfLikes");
const whoLikedPanel = document.getElementById("whoLiked");

numOfLikesDiv.addEventListener("mouseover",()=>{
  whoLikedPanel.style.display = "block";
});
numOfLikesDiv.addEventListener("mouseleave",()=>{
  whoLikedPanel.style.display = "none";
});

