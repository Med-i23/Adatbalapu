// ki kell majd kulon .js fajlba rakni
// a modositasnak "popup" textarea
const modifyButton = document.querySelector('.btn-post-modify');
const modifyPopup = document.querySelector('.post-modify-popup');
const textareaSzoveg = document.querySelector('#modifySzoveg');
const temp = textareaSzoveg.value;

modifyButton.addEventListener('click', function (event) {
    event.preventDefault();
    if (modifyPopup.style.display === 'block') {
        modifyPopup.style.display = 'none';
        textareaSzoveg.value = temp;
    } else {
        modifyPopup.style.display = 'block';
    }
});


