$('link[type="image/x-icon"]').attr('href', `${server}/pic/logo.png`);
$('body').html(`<div class="container-fluid d-flex flex-column">
			<div class="block d-flex flex-column"><span class="h">Ваш e-mail:</span><input type="text" id="email" autocomplete="off" placeholder="missy.elliot@mail.com"></div>
			<div class="block d-flex flex-column"><span class="h">Логин, e-mail партнера</span><textarea id="adv" cols="30" rows="18" placeholder="company_id offer@mail.com, ..."></textarea></div>
			<div class="block d-flex flex-column">
				<div class="d-flex warning op">
					<img src="${server}/pic/loading.gif" class="img-fluid">
					<span class="h">Обработка данных...</span>
				</div>
				<div class="d-flex justify-content-center">
					<div class="myButton neutral">НАЧАТЬ</div>
				</div>
			</div>
		</div>`);