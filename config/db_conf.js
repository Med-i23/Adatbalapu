module.exports = {
    username: 'C##D3FUQL',
    password: '2024Adatb',
    connectString: "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=localhost)(PORT=9999))(CONNECT_DATA=(SERVER=DEDICATED)(SID=orania2)))"
}


/*
Cseréld ki a username-t meg a password-öt az orania-sodra és utána ezt a sort írd be powershell be ->

           ssh -f -N h111111@linux.inf.u-szeged.hu -L 9999:orania2.inf.u-szeged.hu:1521

H-s azonosítót sajátodra cseréld ofc, majd egy jelszót kér amit ha beírsz egy üres konzolba visz (siker)
Hagyd nyitva ezt az ablakot amíg az adatbázist el akarod érninp
 */