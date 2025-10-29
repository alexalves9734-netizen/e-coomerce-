import os
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

from dotenv import load_dotenv


WAIT = 20


def load_env():
    env_path = Path(__file__).resolve().parent / ".env.coolify"
    if env_path.exists():
        load_dotenv(env_path)
    else:
        load_dotenv()  # fallback para variáveis de ambiente do sistema

    required = [
        "COOLIFY_URL",
        "COOLIFY_EMAIL",
        "COOLIFY_PASSWORD",
    ]
    for key in required:
        if not os.getenv(key):
            raise RuntimeError(f"Variável obrigatória ausente: {key}")


def make_driver():
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--no-sandbox")
    # Mantém a janela aberta após script
    chrome_options.add_experimental_option("detach", True)
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.implicitly_wait(3)
    return driver


def wait_click(driver, by, selector):
    return WebDriverWait(driver, WAIT).until(
        EC.element_to_be_clickable((by, selector))
    )


def wait_visible(driver, by, selector):
    return WebDriverWait(driver, WAIT).until(
        EC.visibility_of_element_located((by, selector))
    )


def login_coolify(driver, base_url, email, password):
    driver.get(base_url)
    # Tentar detectar tela de login automaticamente
    try:
        email_input = wait_visible(driver, By.CSS_SELECTOR, 'input[type="email"]')
        pass_input = wait_visible(driver, By.CSS_SELECTOR, 'input[type="password"]')
    except Exception:
        # Se já estiver logado, tentar abrir a página de login explícita
        driver.get(base_url.rstrip('/') + '/auth/login')
        email_input = wait_visible(driver, By.CSS_SELECTOR, 'input[type="email"]')
        pass_input = wait_visible(driver, By.CSS_SELECTOR, 'input[type="password"]')

    email_input.clear(); email_input.send_keys(email)
    pass_input.clear(); pass_input.send_keys(password)

    try:
        submit_btn = wait_click(driver, By.CSS_SELECTOR, 'button[type="submit"]')
        submit_btn.click()
    except Exception:
        # alguns temas usam outro seletor
        submit_btn = wait_click(driver, By.XPATH, "//button[contains(., 'Login') or contains(., 'Entrar')]")
        submit_btn.click()

    # esperar navbar carregar
    WebDriverWait(driver, WAIT).until(
        EC.presence_of_element_located((By.XPATH, "//nav | //a[contains(., 'Projects')]"))
    )


def open_projects_and_create_compose(driver):
    # Abrir Projects
    try:
        wait_click(driver, By.XPATH, "//a[contains(., 'Projects')]").click()
    except Exception:
        driver.get(driver.current_url.split('/')[0] + '/projects')

    # Botão para criar novo serviço
    try:
        wait_click(driver, By.XPATH, "//button[contains(., 'Create') or contains(., 'New Service')]").click()
    except Exception:
        pass

    # Selecionar Docker Compose
    try:
        wait_click(driver, By.XPATH, "//*[contains(., 'Docker Compose')]").click()
    except Exception:
        # fallback direto se houver rota
        driver.get(driver.current_url.rstrip('/') + '/new?type=docker-compose')


def paste_compose_yaml(driver, compose_text):
    # Focar textarea e colar YAML
    textarea = wait_visible(driver, By.CSS_SELECTOR, 'textarea')
    textarea.clear()
    textarea.send_keys(compose_text)
    # Salvar
    try:
        wait_click(driver, By.XPATH, "//button[contains(., 'Save')]").click()
    except Exception:
        pass


def guide_connect_repository(driver, repo_slug, branch):
    print("\n[ATENÇÃO] A conexão com o repositório GitHub requer interação humana (OAuth/seleção).")
    print("Vou abrir a área de Sources para você conectar o GitHub e selecionar o repo.")
    try:
        wait_click(driver, By.XPATH, "//a[contains(., 'Sources')]").click()
    except Exception:
        driver.get(driver.current_url.split('/')[0] + '/sources')

    print("1) Clique em 'Add new source' ou 'Connect', escolha GitHub e autorize se necessário.")
    print(f"2) Selecione o repositório: {repo_slug} e branch: {branch}.")
    print("3) Volte ao serviço recém-criado e clique em 'Connect repository'.")
    input("Quando terminar esses passos manualmente, pressione ENTER para continuar...")


def open_environment_and_fill(driver, env_vars):
    # Abrir aba Environment
    try:
        wait_click(driver, By.XPATH, "//a[contains(., 'Environment')]").click()
    except Exception:
        pass

    # Como cada UI varia, vamos exibir as variáveis e orientar colagem manual
    print("\nCopie/adicione estas variáveis de ambiente no serviço:")
    for k, v in env_vars.items():
        print(f"- {k}={v}")
    input("Após adicionar todas as variáveis manualmente e salvar, pressione ENTER para continuar...")


def main():
    load_env()
    base_url = os.getenv("COOLIFY_URL")
    email = os.getenv("COOLIFY_EMAIL")
    password = os.getenv("COOLIFY_PASSWORD")
    repo_slug = os.getenv("GITHUB_REPO", "alexalves9734-netizen/e-coomerce-")
    branch = os.getenv("REPO_BRANCH", "main")

    # Variáveis do backend/frontend
    env_vars = {
        "CLOUDINARY_CLOUD_NAME": os.getenv("CLOUDINARY_CLOUD_NAME", ""),
        "CLOUDINARY_API_KEY": os.getenv("CLOUDINARY_API_KEY", ""),
        "CLOUDINARY_API_SECRET": os.getenv("CLOUDINARY_API_SECRET", ""),
        "JWT_SECRET": os.getenv("JWT_SECRET", ""),
        "ADMIN_EMAIL": os.getenv("ADMIN_EMAIL", ""),
        "ADMIN_PASSWORD": os.getenv("ADMIN_PASSWORD", ""),
        "VITE_MERCADOPAGO_PUBLIC_KEY": os.getenv("VITE_MERCADOPAGO_PUBLIC_KEY", ""),
    }

    # Ler docker-compose.yml da raiz do repositório
    repo_root = Path(__file__).resolve().parents[1]
    compose_path = repo_root / "docker-compose.yml"
    if not compose_path.exists():
        raise FileNotFoundError(f"Arquivo docker-compose.yml não encontrado em {compose_path}")
    compose_text = compose_path.read_text(encoding="utf-8")

    driver = make_driver()
    try:
        login_coolify(driver, base_url, email, password)
        open_projects_and_create_compose(driver)
        paste_compose_yaml(driver, compose_text)
        guide_connect_repository(driver, repo_slug, branch)
        open_environment_and_fill(driver, env_vars)
        print("\nAgora, no serviço, atribua os domínios do frontend e admin e clique em Deploy.")
        input("Quando concluir o Deploy, pressione ENTER para encerrar...")
    finally:
        print("Script finalizado. A janela do Chrome permanece aberta para conferência.")


if __name__ == "__main__":
    main()