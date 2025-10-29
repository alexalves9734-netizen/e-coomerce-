#Requires -Version 5.1
<#
.SYNOPSIS
  Instala todas as fontes .ttf e .otf presentes em ./scripts/fonts no Windows.

.DESCRIPTION
  Copia e registra as fontes usando a pasta especial de Fonts do Windows.

.USAGE
  Na raiz do projeto:
    powershell -ExecutionPolicy Bypass -File ./scripts/install-fonts.ps1

  O script solicitará privilégios de Administrador automaticamente.
#>

param(
  [string]$FontsSubdir = "fonts"
)

function Ensure-Admin {
  $id = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($id)
  if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Reiniciando com privilégios de administrador..."
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "powershell"
    $psi.Arguments = "-ExecutionPolicy Bypass -File `"$PSCommandPath`""
    $psi.Verb = "runas"
    [System.Diagnostics.Process]::Start($psi) | Out-Null
    exit
  }
}

function Install-FontFile {
  param(
    [Parameter(Mandatory=$true)][string]$FilePath
  )

  if (-not (Test-Path -Path $FilePath -PathType Leaf)) {
    Write-Warning "Arquivo não encontrado: $FilePath"
    return
  }

  try {
    $shell = New-Object -ComObject Shell.Application
    $fontsFolder = $shell.Namespace(0x14) # Pasta especial de fontes do Windows
    Write-Host "Instalando fonte: $(Split-Path $FilePath -Leaf)"
    $fontsFolder.CopyHere($FilePath)
  }
  catch {
    Write-Warning "Falha ao instalar $(Split-Path $FilePath -Leaf): $($_.Exception.Message)"
  }
}

Ensure-Admin

$scriptDir = Split-Path -Parent $PSCommandPath
$fontSourceDir = Join-Path $scriptDir $FontsSubdir

if (-not (Test-Path $fontSourceDir)) {
  Write-Error "Diretório de fontes não encontrado: $fontSourceDir"
  exit 1
}

$fontFiles = Get-ChildItem -Path $fontSourceDir -Include *.ttf, *.otf -File -Recurse

if (-not $fontFiles -or $fontFiles.Count -eq 0) {
  Write-Warning "Nenhum arquivo .ttf/.otf encontrado em $fontSourceDir"
  Write-Host "Copie as fontes para: $fontSourceDir e execute novamente."
  exit 0
}

foreach ($font in $fontFiles) {
  Install-FontFile -FilePath $font.FullName
}

Write-Host "Instalação concluída. Reinicie os aplicativos para ver as fontes instaladas."