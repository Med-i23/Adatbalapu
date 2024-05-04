const modifyButtons = document.querySelectorAll('.btn-post-modify');
const modifyPopups = document.querySelectorAll('.post-modify-popup');
const textareaSzovegek = document.querySelectorAll('#modifySzoveg');
//minden node listben, minden modify buttonhoz sajat textareat rendel,
//így külön külön műkszik
//a querySelectorcsak egyet tud kezelni, ezért nem működött a többi
modifyButtons.forEach(function (modifyButton, index) {
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


$(document).ready(function () {
    let isDropdownOpen = false;

    $('.dropdown-toggle').click(function (event) {
        event.stopPropagation();
        if (isDropdownOpen) {
            $(this).next('.dropdown-menu').hide();
            isDropdownOpen = false;
        } else {
            $(this).next('.dropdown-menu').show();
            isDropdownOpen = true;
        }
    });

    $(document).click(function () {
        $('.dropdown-menu').hide();
        isDropdownOpen = false;
    });

});


$('.img-thumbnail').on('click', function() {
    var imageSrc = $(this).attr('src');
    $('#modalImage').attr('src', imageSrc);
});
