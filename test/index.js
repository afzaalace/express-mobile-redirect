/*jshint node: true, mocha: true*/
var express = require("express");
var path = require("path");
var ua = require(path.join(__dirname, "../index.js"));
var should = require("should");
var request = require("request");
var desktopServer, mobileServer;
describe("Client", function() {
	before(function() {
		/* Desktop */
		var desktopApp = express();
		var dPath = express();
		dPath.use(ua.mobileredirect("http://localhost:3001", true));
		dPath.use(ua.tabletredirect("http://localhost:3001", true));
		dPath.get("/", function(req, res, next) {
			console.log(req.originalUrl);
			return res.json({
				desktopsite: true,
				url: req.originalUrl,
				is_mobile: req.is_mobile,
				is_tablet: req.is_tablet
			});
		});
		var dRoot = express();
		dRoot.use(ua.mobileredirect("http://localhost:3001"));
		dRoot.use(ua.tabletredirect("http://localhost:3001"));
		dRoot.get("/", function(req, res, next) {
			return res.json({
				desktopsite: true,
				url: req.originalUrl,
				is_mobile: req.is_mobile,
				is_tablet: req.is_tablet
			});
		});
		desktopApp.use("/path", dPath);
		desktopApp.use("/", dRoot);
		desktopServer = desktopApp.listen(3000);

		/* Mobile */
		var mobileApp = express();
		var mPath = express();
		mPath.use(ua.is_mobile());
		mPath.use(ua.is_tablet());
		mPath.get("/", function(req, res, next) {
			if (!req.is_mobile && !req.is_tablet) {
				return res.redirect("http://localhost:3000");
			}
			return res.json({
				mobilesite: true,
				url: req.originalUrl,
				is_mobile: req.is_mobile,
				is_tablet: req.is_tablet
			});
		});
		mobileApp.use("/path", mPath);
		mobileApp.use("/", mPath);
		mobileServer = mobileApp.listen(3001);
	});

	/* Tests */
	it("Mobile on m.domain.com", function(done) {
		return request(
			{
				url: "http://localhost:3001",
				headers: {
					"user-agent": "iphone"
				}
			},
			function(err, res, body) {
				var obj;
				if (err) {
					return done(err);
				}
				obj = JSON.parse(body);
				obj.should.have.property("mobilesite");
				obj.mobilesite.should.be.equal(true);
				obj.should.have.property("is_mobile");
				obj.is_mobile.should.be.equal(true);
				obj.should.have.property("is_tablet");
				obj.is_tablet.should.be.equal(false);
				return done();
			}
		);
	});

	it("Mobile on domain.com to m.domain.com", function(done) {
		return request(
			{
				url: "http://localhost:3000",
				headers: {
					"user-agent": "iphone"
				}
			},
			function(err, res, body) {
				var obj;
				if (err) {
					return done(err);
				}
				obj = JSON.parse(body);
				obj.should.have.property("mobilesite");
				obj.mobilesite.should.be.equal(true);
				obj.should.have.property("is_mobile");
				obj.is_mobile.should.be.equal(true);
				obj.should.have.property("is_tablet");
				obj.is_tablet.should.be.equal(false);
				return done();
			}
		);
	});

	it("Mobile on domain.com to m.domain.com with forwarded path", function(done) {
		return request(
			{
				url: "http://localhost:3000/path",
				headers: {
					"user-agent": "iphone"
				}
			},
			function(err, res, body) {
				var obj;
				if (err) {
					return done(err);
				}
				obj = JSON.parse(body);
				obj.should.have.property("mobilesite");
				obj.mobilesite.should.be.equal(true);
				obj.should.have.property("is_mobile");
				obj.is_mobile.should.be.equal(true);
				obj.should.have.property("is_tablet");
				obj.is_tablet.should.be.equal(false);
				obj.should.have.property("url");
				obj.url.should.be.equal("/path");
				return done();
			}
		);
	});

	it("Mobile on domain.com to m.domain.com without forwarded path", function(done) {
		return request(
			{
				url: "http://localhost:3000/somerandomurl",
				headers: {
					"user-agent": "iphone"
				}
			},
			function(err, res, body) {
				var obj;
				if (err) {
					return done(err);
				}
				obj = JSON.parse(body);
				obj.should.have.property("mobilesite");
				obj.mobilesite.should.be.equal(true);
				obj.should.have.property("is_mobile");
				obj.is_mobile.should.be.equal(true);
				obj.should.have.property("is_tablet");
				obj.is_tablet.should.be.equal(false);
				obj.should.have.property("url");
				obj.url.should.be.equal("/");
				return done();
			}
		);
	});

	it("Tablet on m.domain.com", function(done) {
		return request(
			{
				url: "http://localhost:3001",
				headers: {
					"user-agent": "ipad"
				}
			},
			function(err, res, body) {
				var obj;
				if (err) {
					return done(err);
				}
				obj = JSON.parse(body);
				obj.should.have.property("mobilesite");
				obj.mobilesite.should.be.equal(true);
				obj.should.have.property("is_mobile");
				obj.is_mobile.should.be.equal(false);
				obj.should.have.property("is_tablet");
				obj.is_tablet.should.be.equal(true);
				return done();
			}
		);
	});

	it("Tablet on domain.com to m.domain.com", function(done) {
		return request(
			{
				url: "http://localhost:3000",
				headers: {
					"user-agent": "ipad"
				}
			},
			function(err, res, body) {
				var obj;
				if (err) {
					return done(err);
				}
				obj = JSON.parse(body);
				obj.should.have.property("mobilesite");
				obj.mobilesite.should.be.equal(true);
				obj.should.have.property("is_mobile");
				obj.is_mobile.should.be.equal(false);
				obj.should.have.property("is_tablet");
				obj.is_tablet.should.be.equal(true);
				return done();
			}
		);
	});

	it("Tablet on domain.com to m.domain.com with forwarded path", function(done) {
		return request(
			{
				url: "http://localhost:3000/path",
				headers: {
					"user-agent": "ipad"
				}
			},
			function(err, res, body) {
				var obj;
				if (err) {
					return done(err);
				}
				obj = JSON.parse(body);
				obj.should.have.property("mobilesite");
				obj.mobilesite.should.be.equal(true);
				obj.should.have.property("is_mobile");
				obj.is_mobile.should.be.equal(false);
				obj.should.have.property("is_tablet");
				obj.is_tablet.should.be.equal(true);
				obj.should.have.property("url");
				obj.url.should.be.equal("/path");
				return done();
			}
		);
	});

	it("Tablet on domain.com to m.domain.com without forwarded path", function(done) {
		return request(
			{
				url: "http://localhost:3000/somerandomurl",
				headers: {
					"user-agent": "ipad"
				}
			},
			function(err, res, body) {
				var obj;
				if (err) {
					return done(err);
				}
				obj = JSON.parse(body);
				obj.should.have.property("mobilesite");
				obj.mobilesite.should.be.equal(true);
				obj.should.have.property("is_mobile");
				obj.is_mobile.should.be.equal(false);
				obj.should.have.property("is_tablet");
				obj.is_tablet.should.be.equal(true);
				obj.should.have.property("url");
				obj.url.should.be.equal("/");
				return done();
			}
		);
	});

	it("Desktop on m.domain.com to domain.com", function(done) {
		return request(
			{
				url: "http://localhost:3001",
				headers: {
					"user-agent": "firefox"
				}
			},
			function(err, res, body) {
				var obj;
				if (err) {
					return done(err);
				}
				obj = JSON.parse(body);
				obj.should.have.property("desktopsite");
				obj.desktopsite.should.be.equal(true);
				obj.should.have.property("is_mobile");
				obj.is_mobile.should.be.equal(false);
				obj.should.have.property("is_tablet");
				obj.is_tablet.should.be.equal(false);
				return done();
			}
		);
	});

	it("Desktop on domain.com", function(done) {
		return request(
			{
				url: "http://localhost:3000",
				headers: {
					"user-agent": "firefox"
				}
			},
			function(err, res, body) {
				var obj;
				if (err) {
					return done(err);
				}
				obj = JSON.parse(body);
				obj.should.have.property("desktopsite");
				obj.desktopsite.should.be.equal(true);
				obj.should.have.property("is_mobile");
				obj.is_mobile.should.be.equal(false);
				obj.should.have.property("is_tablet");
				obj.is_tablet.should.be.equal(false);
				return done();
			}
		);
	});

	it("Null useragent", function(done) {
		return request(
			{
				url: "http://localhost:3000",
				headers: {}
			},
			function(err, res, body) {
				var obj;
				if (err) {
					return done(err);
				}
				obj = JSON.parse(body);
				obj.should.have.property("desktopsite");
				obj.desktopsite.should.be.equal(true);
				obj.should.have.property("is_mobile");
				obj.is_mobile.should.be.equal(false);
				obj.should.have.property("is_tablet");
				obj.is_tablet.should.be.equal(false);
				return done();
			}
		);
	});

	it("Secondary useragent", function(done) {
		return request(
			{
				url: "http://localhost:3000",
				headers: {
					"user-agent": "zte-56"
				}
			},
			function(err, res, body) {
				var obj;
				if (err) {
					return done(err);
				}
				obj = JSON.parse(body);
				obj.should.have.property("mobilesite");
				obj.mobilesite.should.be.equal(true);
				obj.should.have.property("is_mobile");
				obj.is_mobile.should.be.equal(true);
				obj.should.have.property("is_tablet");
				obj.is_tablet.should.be.equal(false);
				return done();
			}
		);
	});
	after(function() {
		desktopServer.close();
		mobileServer.close();
	});
});
