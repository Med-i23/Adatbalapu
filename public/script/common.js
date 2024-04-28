// ki kell majd kulon .js fajlba rakni
// a modositasnak "popup" textarea
const modifyButtons = document.querySelectorAll('.btn-post-modify');
const modifyPopups = document.querySelectorAll('.post-modify-popup');
const textareaSzovegek = document.querySelectorAll('#modifySzoveg');

//minden node listben, minden modify buttonhoz sajat textareat rendel,
//így külön külön műkszik
//a querySelectorcsak egyet tud kezelni, ezért nem működött a többi
modifyButtons.forEach(function(modifyButton, index) {
    let temp = textareaSzovegek[index].value;
    modifyButton.addEventListener('click', function (event) {
        event.preventDefault();
        if (modifyPopups[index].style.display === 'block') {
            modifyPopups[index].style.display = 'none';
            textareaSzovegek[index].value = temp;
        } else {
            modifyPopups[index].style.display = 'block';
        }
    });
});
