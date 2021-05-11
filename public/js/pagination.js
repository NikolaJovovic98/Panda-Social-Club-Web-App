let paginationDiv = document.getElementById("pagination-div");
const pagesDiv = document.getElementById("pages");
let page = document.getElementById("posts-big-div").dataset.page;
const pagination_a = document.getElementsByClassName("pagination-a");
const left_pag = document.getElementById("left-pag");
const right_pag = document.getElementById("right-pag");
page = parseInt(page);
numberOfPosts = paginationDiv.dataset.numofposts;
numberOfPosts = parseInt(numberOfPosts);
let numberOfSquares = 0;
if (numberOfPosts % 3 == 0) {
    numberOfSquares = numberOfPosts / 3;
} else {
    numberOfSquares = Math.floor(numberOfPosts / 3) + 1;
}
for (let i = 1; i <= numberOfSquares; i++) {
    let a = document.createElement('a');
    a.setAttribute("href", `/?page=${i}`);
    a.innerText = i;
    a.classList.add("pagination-a");
    pagesDiv.append(a);
}
localStorage.setItem("page", JSON.stringify(page));

function removeActive(pagination_a, number) {
    Array.from(pagination_a).forEach(a => {
        if (parseInt(a.innerText) !== number) {
            a.classList.remove("active");
        }
    });
}

function setActive(pagination_a, number) {
    Array.from(pagination_a).forEach(a => {
        if (parseInt(a.innerText) === number) {
            a.classList.add("active");
        }
    });
}

right_pag.addEventListener("click",()=>{
    if(page===numberOfSquares){
        return;
    }else{
        pagination_a[page].click();
    } 
});

left_pag.addEventListener("click",()=>{
    if(page===1){
        return;
    }else{
        pagination_a[page-2].click();
    }
}); 

window.onload = () => {
    let number = JSON.parse(localStorage.getItem("page"));
    setActive(pagination_a, number);
    removeActive(pagination_a, number);
}