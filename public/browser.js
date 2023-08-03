function template(array) {
    return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
    <span class="item-text">${array.text}</span>
    <div>
      <button data-id="${array._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
      <button data-id="${array._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
    </div>
  </li>`
}

//page load render
let HTML = items.map(function(array) {
  return template(array)
}).join('')
document.getElementById("item-list").insertAdjacentHTML("beforeend", HTML)

//create feature
let createField = document.getElementById("create-field")
document.getElementById("create-form").addEventListener("submit", function(e) {
    e.preventDefault()
    axios.post("/create-item", {text: createField.value}).then(function (response) {
       //work on it later
       document.getElementById("item-list").insertAdjacentHTML("beforeend", template(response.data))
       createField.value =""
       createField.focus()
     }).catch(function() {
      console.log("ERROR!")
     })
})

document.addEventListener("click", function(event) {
    //delete feature
    if (event.target.classList.contains("delete-me")) {
        if(confirm("are you sure?")) {
            axios.post("/delete-item", {id: event.target.getAttribute("data-id") }).then(function() {
                event.target.parentElement.parentElement.remove()
             }).catch(function() {
              console.log("ERROR!")
             })
        }
    }
    
    //update feature
    if (event.target.classList.contains("edit-me")) {
       let userInput = prompt("Enter New Text", event.target.parentElement.parentElement.querySelector(".item-text").innerHTML)
      if(userINput) {
        axios.post("/edit-item", {text: userInput, id: event.target.getAttribute("data-id") }).then(function() {
            event.target.parentElement.parentElement.querySelector(".item-text").innerHTML = userInput
         }).catch(function() {
          console.log("ERROR!")
         })
      }
    }
})