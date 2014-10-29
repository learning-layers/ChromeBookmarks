function checkValidUrl(url) {
	var regexp = new RegExp('^https?://', 'i');
	return regexp.test(url);
}
