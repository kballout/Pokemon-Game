let ip
window.addEventListener('load', () => {
    const form = document.querySelector('#connectUser');
    let socket = io()
    socket.on('connect', () => {
        socket.emit('userEnteredPage', {
            ip: ip
        });
    })
  
    form.addEventListener('submit', () => {
        document.querySelector('#ip').setAttribute('value', ip);
    })

})

function setIp(Ip){
    ip = Ip
}


