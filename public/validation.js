//let numberOfConversions = 0;
//let convNum = document.getElementById("convNum");

function validateForm(e){
    if( document.getElementById("uploadWordID").files.length == 0 || document.getElementById("userEmailID").value.length == 0){
        alert("Must fill all fields");
        e.preventDefault();
    }else{
        //ovo se odradi pa se odma makne
        console.log("GOOD");
        numberOfConversions+=1;
        localStorage.setItem("numberOfConversions_ls", JSON.stringify(numberOfConversions));
        convNum.innerText=numberOfConversions;
    }
}

function init(){
   /* window.onload = () => {
        if (localStorage.getItem("numberOfConversions_ls") === null) {
            return;
        } else {
           convNum.innerText = localStorage.getItem("numberOfConversions_ls");
        }
    }*/
    document.getElementById("upload-button")
            .addEventListener("click",validateForm);
}

init();
