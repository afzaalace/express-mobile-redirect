/*jshint node: true, mocha: true*/
var express = require('express');
var ua = require('../index.js');
var request = require('request');
describe('Client', function() {

	/* Desktop */
	var app = express();
	app.use(ua.mobileredirect('http://localhost:3001'));
	app.use(ua.tabletredirect('http://localhost:3001'));
	app.get('/', function(req, res) {
		return res.json({
			desktopsite: true,
			is_mobile: req.is_mobile,
			is_tablet: req.is_tablet
		});
	});
	app.listen(3000);

	/* Mobile */
	var app2 = express();
	app2.use(ua.is_mobile());
	app2.use(ua.is_tablet());
	app2.get('/', function(req, res) {
		if (!req.is_mobile && !req.is_tablet) {
			return res.redirect('http://localhost:3000');
		}
		return res.json({
			mobilesite: true,
			is_mobile: req.is_mobile,
			is_tablet: req.is_tablet
		});
	});
	app2.listen(3001);

	/* Tests */
	it('Mobile on m.domain.com', function(done) {
		return request({
			url: 'http://localhost:3001',
			headers: {
				'user-agent': 'iphone'
			}
		}, function(err, res, body) {
			var obj;
			if (err) {
				return done(err);
			}
			obj = JSON.parse(body);
			obj.should.have.property('mobilesite');
			obj.mobilesite.should.be.equal(true);
			obj.should.have.property('is_mobile');
			obj.is_mobile.should.be.equal(true);
			obj.should.have.property('is_tablet');
			obj.is_tablet.should.be.equal(false);
			return done();
		});
	});
	it('Mobile on domain.com to m.domain.com', function(done) {
		return request({
			url: 'http://localhost:3000',
			headers: {
				'user-agent': 'iphone'
			}
		}, function(err, res, body) {
			var obj;
			if (err) {
				return done(err);
			}
			obj = JSON.parse(body);
			obj.should.have.property('mobilesite');
			obj.mobilesite.should.be.equal(true);
			obj.should.have.property('is_mobile');
			obj.is_mobile.should.be.equal(true);
			obj.should.have.property('is_tablet');
			obj.is_tablet.should.be.equal(false);
			return done();
		});
	});
	it('Tablet on m.domain.com', function(done) {
		return request({
			url: 'http://localhost:3001',
			headers: {
				'user-agent': 'ipad'
			}
		}, function(err, res, body) {
			var obj;
			if (err) {
				return done(err);
			}
			obj = JSON.parse(body);
			obj.should.have.property('mobilesite');
			obj.mobilesite.should.be.equal(true);
			obj.should.have.property('is_mobile');
			obj.is_mobile.should.be.equal(false);
			obj.should.have.property('is_tablet');
			obj.is_tablet.should.be.equal(true);
			return done();
		});
	});
	it('Tablet on domain.com to m.domain.com', function(done) {
		return request({
			url: 'http://localhost:3000',
			headers: {
				'user-agent': 'ipad'
			}
		}, function(err, res, body) {
			var obj;
			if (err) {
				return done(err);
			}
			obj = JSON.parse(body);
			obj.should.have.property('mobilesite');
			obj.mobilesite.should.be.equal(true);
			obj.should.have.property('is_mobile');
			obj.is_mobile.should.be.equal(false);
			obj.should.have.property('is_tablet');
			obj.is_tablet.should.be.equal(true);
			return done();
		});
	});
	it('Desktop on m.domain.com to domain.com', function(done) {
		return request({
			url: 'http://localhost:3001',
			headers: {
				'user-agent': 'firefox'
			}
		}, function(err, res, body) {
			var obj;
			if (err) {
				return done(err);
			}
			obj = JSON.parse(body);
			obj.should.have.property('desktopsite');
			obj.desktopsite.should.be.equal(true);
			obj.should.have.property('is_mobile');
			obj.is_mobile.should.be.equal(false);
			obj.should.have.property('is_tablet');
			obj.is_tablet.should.be.equal(false);
			return done();
		});
	});
	it('Desktop on domain.com', function(done) {
		return request({
			url: 'http://localhost:3000',
			headers: {
				'user-agent': 'firefox'
			}
		}, function(err, res, body) {
			var obj;
			if (err) {
				return done(err);
			}
			obj = JSON.parse(body);
			obj.should.have.property('desktopsite');
			obj.desktopsite.should.be.equal(true);
			obj.should.have.property('is_mobile');
			obj.is_mobile.should.be.equal(false);
			obj.should.have.property('is_tablet');
			obj.is_tablet.should.be.equal(false);
			return done();
		});
	});
});
