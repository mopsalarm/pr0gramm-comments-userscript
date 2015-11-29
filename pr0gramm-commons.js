
"use strict";
Date.RELATIVE_TIME_PERIODS = {
    Jahr: 31536000,
    Monat: 2628000,
    Woche: 604800,
    Tag: 86400,
    Stunde: 3600,
    Minute: 60,
    Moment: -1
};

Date.now = Date.now || function() {
    return (new Date()).getTime();
};

Date.secondsToString = Date.secondsToString || function(rawSeconds) {
    var days = Math.floor(rawSeconds / (60 * 60 * 24));
    var hours = Math.floor((rawSeconds % (60 * 60 * 24)) / (60 * 60));
    var minutes = Math.floor((rawSeconds % (60 * 60)) / 60);
    var seconds = rawSeconds % 60;
    return days + " Tag(e), " + hours + " Stunde(n), " + minutes + " Minute(n), " + seconds + " Sekunde(n)";
};

Date.prototype.unix = Date.prototype.unix || function() {
    return Math.floor(this.getTime() / 1000);
};

Date.prototype.relativeTime = Date.prototype.relativeTime || function(forcePast, noprefix) {
    var diff = (new Date()).getTime() / 1000 - this.getTime() / 1000;
    if (forcePast && diff < 0) {
        diff = 0;
    }
    var prefix = noprefix ? '' : (diff >= 0) ? "vor " : "in ";
    diff = Math.abs(diff);
    for (var period in Date.RELATIVE_TIME_PERIODS) {
        var length = Date.RELATIVE_TIME_PERIODS[period];
        if (diff > length) {
            if (length > 0) {
                diff = Math.round(diff / length);
                var plural = diff > 1 ? (period.substr(-1) == 'e' ? 'n' : 'en') : '';
                return prefix + diff + " " + period + plural;
            } else {
                return prefix + "einem Moment";
            }
        }
    }
    return false;
};

Date.MONTH_NAMES = Date.MONTH_NAMES || ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

Date.prototype.readableTime = Date.prototype.readableTime || function() {
    var h = this.getHours();
    var m = this.getMinutes();
    return this.getDate() + ". " +
        Date.MONTH_NAMES[this.getMonth()] + " " +
        this.getFullYear() + " - " +
        (h > 9 ? h : '0' + h) + ":" + (m > 9 ? m : '0' + m);
};

Date.prototype.readableDate = Date.prototype.readableDate || function() {
    return this.getDate() + ". " +
        Date.MONTH_NAMES[this.getMonth()] + " " +
        this.getFullYear();
};

var pu = {
  addRoute: function(path, view) {
    p.addRoute(view, path);
    var tmpRoute = p._routes[p._routes.length-2];
    p._routes[p._routes.length-2] = p._routes[p._routes.length-1];
    p._routes[p._routes.length-1] = tmpRoute;

    if (p.getURL() === path) {
      p.navigateTo(path, p.NAVIGATE.FORCE);
    }
  }
}
