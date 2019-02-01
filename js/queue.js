let cancel = false;
let sec = 1;

function _ask() {
    setTimeout(_needQueue, sec * 1000)
}


function _needQueue() {
    $.get(`${server}/downloads?selfid=${selfId}`).done(r => {
        _updateDown(r)
    }).fail((x, s, e) => {
        let er = e.toLowerCase();
        if (er.includes('bad') || x.status >= 400)
            _needQueue()
    })
}

function _updateDown(obj) {
    if (obj.length > 0) {
        $offs.find('.offer').each(function() {
            if ($(this).find('.myMark').hasClass('ch')) {
                let n = $(this).find('.name').text();
                if (obj.includes(n)) {
                    $(this).find('.date-sent').removeClass('view');
                    $(this).find('.download').addClass('done');
                    $warn1.text(parseInt($warn1.text()) + 1);
                }
            }
        })
        if (!cancel)
            _ask()
        else
            cancel = false;
    } else {
        $down.removeClass('inactive');
    }
    if (cancel) {
        $down.removeClass('inactive');
        cancel = false;
    }
}