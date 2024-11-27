<h1>Welcome to the Physics is Phun Repo</h1>
<p>We are a free and open source site dedicated to giving students platform to tutor and learn Physics</p>
<br>
<h2>Get Started</h2>
<p>You can use our website <a href="https://physics-is-phun.onrender.com" target="_blank" >here</a>.</p>
<br>
<h2>Self-Host</h2>
<ol>
<li>
  <p>If you want to host the site by yourself, download or clone this repo to your local machine or a cloud server.</p>
</li>
<li>
  <p>After extracting the zip, create a file called ".env" to store your secrets.</p>
</li>
<li>
  <p>You will need to create a POSTGRES database and find its external psql command (you can find out how to make one online)</p>
</li>
<li>
  The .env file should contain one line in this format (no quotation marks around psql command): 
  <code>DBURL=your-psql-command</code>
</li>
<li>
  <p>Finally, run the file in terminal (or vscode terminal) by typing <code>npm run build</code> to build and then <code>npm run start</code> to start.</p>
</li>
</ol>
