let info = {};
let $em;
let $par;
let $war;
let total = 0;
let iter = 0;
let err = false;
let admUrl = location.href + 'toolbox/autocomplete/?term=';

function _bClick(e) {
    e.stopImmediatePropagation();
    let _ob = {};
    let correct = true;
    $em.add($par).each(function() {
        if ($(this).val().trim() == '') {
            $(this).addClass('at');
            correct = false
        }
    });
    if (!reg.test($em.val().trim())) {
        if (!$em.hasClass('at'))
            $em.addClass('at')
        correct = false
    }
    if (correct) {
        $em.attr('disabled', '');
        $par.attr('disabled', '');
        let err = [];
        let email = [];
        info.email = $em.val().trim();
        let arr = $par.val().trim().split(k);
        for (let u of arr) {
            let jo = u.split(log);
            if (jo.length == 1) {
                email.push(jo[0])
            } else {
                if (!log.test(jo[0])) {
                    if (reg.test(jo[1])) {
                        _ob[jo[0]] = {
                            email: jo[1]
                        }
                    } else
                        err.push(jo[1])
                } else {
                    err.push(jo.join(' '))
                }
            }
        }
        if (email.length != 0 || err.length != 0) {
            $em.removeAttr('disabled');
            $par.removeAttr('disabled');
            $par.addClass('at')
            $war.addClass('op');
            let mes = '';
            if (err.length != 0) {
                mes += 'Ошибки в написании:\n• ';
                mes += err.join(',\n• ') + '.\n\n';
            }
            if (email.length != 0) {
                mes += 'Нет e-mail:\n• ';
                mes += email.join(',\n• ');
            }
            alert(mes);
        } else if (email.length == 0 && err.length == 0) {
            $em.attr('disabled', '');
            $par.attr('disabled', '');
            $war.removeClass('op');
            info['offers'] = {};
            ({...info['offers']
            } = _ob);
            total = Object.keys(info['offers']).length;
            for (let i in info['offers'])
                _findId(i);
        }
    }
}

function _reset(e) {
    let $el = $(e.target);
    if ($el.hasClass('at'))
        $el.removeClass('at')
}

function _findId(off) {
    $.get(`${admUrl}${off}`).done(r => {
        if (r.length == 0) {
            info.offers[off].id = null;
            err = true;
            ++iter;
        } else {
            for (let i of r) {
                if (i.value == off) {
                    info.offers[off].id = i.label;
                    ++iter;
                }
            }
            if (!info.offers[off].hasOwnProperty('id')) {
                info.offers[off].id = null;
                err = true;
                ++iter;
            }
        }
        if (iter == total) {
            iter = 0;
            _total();
        }
    }).fail((x, s, e) => {
        let er = e.toLowerCase();
        if (er.includes('bad') || x.status >= 400)
            _findId(off);
    })
}

function _total() {
    if (err) {
        $em.removeAttr('disabled');
        $par.removeAttr('disabled');
        $par.addClass('at');
        $war.addClass('op');
        let err = [];
        for (let i in info['offers']) {
            if (info['offers'][i].id == null)
                err.push(i)
        }
        let mes = '';
        if (err.length != 0) {
            mes += 'Ошибки в написании:\n• ';
            mes += err.join(',\n• ') + '.';
        }
        alert(mes)
    }
    else{
    	chrome.runtime.sendMessage(`${selfId}`,{pin:'info',bag:info})
    }
}

$em = $('#email');
$par = $('#adv');
$war = $('.warning');

$('.myButton').bind('click', _bClick);
$em.add($par).bind({
    'click': _reset,
    'keydown': _reset
})