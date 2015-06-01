server {
    listen 80;
    index index.html index.htm;
    server_name altari.oguzgelal.com;
    root /var/www/altari.oguzgelal.com;

    location / {
		try_files $uri $uri/ =404;
	}
}