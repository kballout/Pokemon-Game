const form = document.querySelector('#joinGame');
const invite = document.querySelector('#inviteLink');

form.addEventListener('submit', (event)=>{
    fetch('/getIds', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(json => {
        let userIds = json.userIds
        let link = invite.value;
        if(checkIds(userIds, link) === false){
            event.preventDefault();
            alert('Id could not be found')
        }
    })
    .catch(e => console.log(e.message))
})

function checkIds(userIds, link){
    for(let i = 0; i < userIds.length(); i++){
        if(userIds[i]['Socket'] === link){
            return true;
        }
    }
    return false;
}