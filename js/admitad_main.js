$('link[type="image/x-icon"]').attr('href', `${server}/pic/logo.png`);
$('body').html(`<div class="container-fluid d-flex flex-column">
			<div class="block d-flex flex-column">
				<div class="h d-flex justify-content-end">
					<span class="h">Дата:</span>
					<input type="text" class="date">
				</div>
			</div>
			<div class="block d-flex flex-column">
				<div class="offer d-flex top">
					<div class="myMark all ch"></div>
				</div>
				<div class="d-flex flex-column offers">
					<div class="wait"></div>
					<div class="add">
						<i class="fas fa-plus"></i>
					</div>
					
				</div>
			</div>
			<div class="block d-flex flex-column">
				<div class="d-flex warning op h">
					<img src="${server}/pic/loading.gif" class="img-fluid">
					<span class="h">Обработка данных...</span>
					<span class="h alr"></span>/<span class="h total"></span>
					<div class="reject d-flex align-items-center">
							<i class="fas fa-times-circle"></i>
					</div>
				</div>
				<div class="d-flex justify-content-around">
					<div class="myButton blue">ВЫГРУЗИТЬ</div>
					<div class="myButton green">ОТПРАВИТЬ</div>
					<div class="myButton neutral">СБРОС</div>
				</div>
			</div>
		</div>
	`);