import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select

def capture():
    opts = Options()
    opts.add_argument('--headless=new')
    opts.add_argument('--window-size=1440,1050')
    opts.add_argument('--disable-gpu')

    driver = webdriver.Chrome(options=opts)
    out_dir = os.path.abspath(r'Integrated_MicroProject_FLAT_DAA_COA\screenshots')
    os.makedirs(out_dir, exist_ok=True)

    try:
        print('Navigating to local server http://127.0.0.1:8000...')
        driver.get('http://127.0.0.1:8000')
        time.sleep(2)

        # Helper to clean toasts
        def clear_toasts():
            try:
                driver.execute_script("const c = document.getElementById('toast-container'); if (c) c.innerHTML = '';")
            except:
                pass

        # 1. Overview Dashboard (All-in-one)
        clear_toasts()
        driver.save_screenshot(os.path.join(out_dir, 'overview_dashboard.png'))
        print('Captured overview_dashboard.png')

        # 2. FLAT DFA Module
        btn_flat = driver.find_element(By.CSS_SELECTOR, '[data-view="dfa"]')
        btn_flat.click()
        time.sleep(1)
        clear_toasts()
        driver.save_screenshot(os.path.join(out_dir, 'flat_dfa_module.png'))
        print('Captured flat_dfa_module.png')

        # 3. FLAT Syntax Rejection
        preset_sel = Select(driver.find_element(By.ID, 'preset-selector'))
        preset_sel.select_by_value('syntax_error')
        time.sleep(1)
        clear_toasts()
        driver.save_screenshot(os.path.join(out_dir, 'flat_dfa_syntax_rejection.png'))
        print('Captured flat_dfa_syntax_rejection.png')

        # Reset to arithmetic preset
        preset_sel.select_by_value('arithmetic')
        time.sleep(1)

        # 4. COA 5-Stage Pipeline Module (Forwarding Enabled)
        btn_coa = driver.find_element(By.CSS_SELECTOR, '[data-view="pipeline"]')
        btn_coa.click()
        time.sleep(1)
        clear_toasts()
        driver.save_screenshot(os.path.join(out_dir, 'coa_pipeline_module.png'))
        print('Captured coa_pipeline_module.png')

        # 5. COA Forwarding Comparison (Toggle Off)
        toggle_fwd = driver.find_element(By.ID, 'toggle-forwarding')
        if toggle_fwd.is_selected():
            toggle_fwd.click()
            time.sleep(1)
        clear_toasts()
        driver.save_screenshot(os.path.join(out_dir, 'coa_pipeline_forwarding_comparison.png'))
        print('Captured coa_pipeline_forwarding_comparison.png')

        # Reset forwarding back to True
        if not toggle_fwd.is_selected():
            toggle_fwd.click()
            time.sleep(1)

        # 6. DAA Dijkstra Module (Target: WB_BUS)
        btn_daa = driver.find_element(By.CSS_SELECTOR, '[data-view="dijkstra"]')
        btn_daa.click()
        time.sleep(1)
        clear_toasts()
        driver.save_screenshot(os.path.join(out_dir, 'daa_dijkstra_module.png'))
        print('Captured daa_dijkstra_module.png')

        # 7. DAA Dijkstra Route (Target: DATA_MEM)
        target_sel = Select(driver.find_element(By.ID, 'dijkstra-target-select'))
        target_sel.select_by_value('DATA_MEM')
        time.sleep(1)
        clear_toasts()
        driver.save_screenshot(os.path.join(out_dir, 'daa_dijkstra_data_memory_route.png'))
        print('Captured daa_dijkstra_data_memory_route.png')

    finally:
        driver.quit()

    print('All distinct screenshots captured successfully!')

if __name__ == '__main__':
    capture()
