@echo off
echo 🚀 Adding Google Analytics to HTML files...
echo.

set "GA_TAG=    <!-- Google tag (gtag.js) -->"
set "SCRIPT1=    <script async src=\"https://www.googletagmanager.com/gtag/js?id=G-4SVB78MBHN\"></script>"
set "SCRIPT2=    <script>"
set "SCRIPT3=      window.dataLayer = window.dataLayer || [];"
set "SCRIPT4=      function gtag(){dataLayer.push(arguments);}"
set "SCRIPT5=      gtag('js', new Date());"
set "SCRIPT6="
set "SCRIPT7=      gtag('config', 'G-4SVB78MBHN');"
set "SCRIPT8=    </script>"

set count=0
set updated=0

for %%f in (*.html) do (
    set /a count+=1
    echo Checking: %%f
    
    findstr /c:"G-4SVB78MBHN" "%%f" >nul
    if errorlevel 1 (
        echo   ✓ Adding GA tag to: %%f
        set /a updated+=1
        
        rem Create temporary file with GA code added after <head>
        (
            for /f "usebackq delims=" %%a in ("%%f") do (
                echo %%a
                echo %%a | findstr /i "<head" >nul
                if not errorlevel 1 (
                    echo %GA_TAG%
                    echo %SCRIPT1%
                    echo %SCRIPT2%
                    echo %SCRIPT3%
                    echo %SCRIPT4%
                    echo %SCRIPT5%
                    echo %SCRIPT6%
                    echo %SCRIPT7%
                    echo %SCRIPT8%
                )
            )
        ) > "%%f.tmp"
        
        move "%%f.tmp" "%%f" >nul
    ) else (
        echo   ⚠ GA tag already exists in: %%f
    )
)

echo.
echo 📊 Summary:
echo    Files processed: %count%
echo    Files updated: %updated%
echo.
if %updated% gtr 0 (
    echo ✅ Google Analytics successfully added to %updated% HTML files!
) else (
    echo ✅ All HTML files already have Google Analytics configured!
)

pause
