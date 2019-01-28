$('link[type="image/x-icon"]').attr('href', `${server}/pic/logo.png`);
$('title').html('Обработка...');
$('body').html(`<img src="${server}/pic/loading.gif" style="position:absolute;">`);
$('body').css('display', 'contents');