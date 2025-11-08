module.exports = function (req, res, next) {
    // We check the req.user object that was set by the 'auth' middleware
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Admin resource. Access denied.' });
    }
    next();
};