/* REGISTER VALIDATION */

const registerButton = document.getElementById("register-button");
const emailRegex = /\S+@\S+\.\S+/;

let firstName = document.querySelector(`#register-form [name="firstName"]`);
let lastName = document.querySelector(`#register-form [name="lastName"]`);
let email = document.querySelector(`#register-form [name="email"]`);
let password_original = document.querySelector(`#register-form [name="password_original"]`);
let password_repeat = document.querySelector(`#register-form [name="password_repeat"]`);

firstName.addEventListener("keyup",(e)=>{
    if(e.target.value.length<2){
        e.target.style.color="red";
    }else{
        e.target.style.color="green";
    }
});

lastName.addEventListener("keyup",(e)=>{
    if(e.target.value.length<2){
        e.target.style.color="red";
    }else{
        e.target.style.color="green";
    }
});

email.addEventListener("keyup",(e)=>{
    if(!emailRegex.test(e.target.value)){
        e.target.style.color="red";
    }else {
        e.target.style.color="green";
    }
});

password_original.addEventListener("keyup",(e)=>{
    if(e.target.value.length<6){
        console.log("MUST BE ABOVE 6");
    }else{
        console.log("GOOD PASSWORD");
    }
});