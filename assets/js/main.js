window.onload = function() {
    const form = document.querySelector('#connectUser');
    form.addEventListener('submit', (event) => {

    let name = document.querySelector('#username').value
    
    fetch('/getUsers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(json => {
        let allUsers = json.users
        if(checkUser(allUsers, name)){
            event.preventDefault();
        }
    })
    .catch(e => console.log(e.message))
    })
}


function checkUser(users, name){
    for(let i = 0; i < users.length; i++){
        if(users[i].User === name){
            alert('someone is using that name')
            return true;
        }
    }
    return false;
    
}

