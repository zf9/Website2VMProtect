document.getElementById('license-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const licenseKey = document.getElementById('license-key').value;
    const loading = document.getElementById('loading');

    // Show the loading animation
    loading.style.display = 'block';

    try {
        const response = await fetch('/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ licenseKey: licenseKey })
        });

        if (response.status === 200) {
            const contentDisposition = response.headers.get('Content-Disposition');
            const filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
        } else {
            alert('Invalid License Key');
        }
    } catch (error) {
        alert('Error validating license key');
        console.error('Error:', error);
    } finally {
        // Hide the loading animation
        loading.style.display = 'none';
    }
});
