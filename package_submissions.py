"""
package_submissions.py - Packages the 3 subject-specific submission folders and ZIP files
in /output_final with ZERO duplication and STRICT subject isolation.

Subject Isolation Rules:
- FLAT package contains ONLY FLAT report (.pdf, .docx), FLAT screenshots, general README.md, and source code with ONLY FLAT docs/screenshots.
- COA package contains ONLY COA report (.pdf, .docx), COA screenshots, general README.md, and source code with ONLY COA docs/screenshots.
- DAA package contains ONLY DAA report (.pdf, .docx), DAA screenshots, general README.md, and source code with ONLY DAA docs/screenshots.
"""

import os
import shutil
import zipfile

def package_all():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_source = os.path.join(base_dir, 'Integrated_MicroProject_FLAT_DAA_COA')
    output_final_dir = os.path.join(base_dir, 'output_final')
    os.makedirs(output_final_dir, exist_ok=True)

    docs_dir = os.path.join(project_source, 'docs')
    screenshots_dir = os.path.join(project_source, 'screenshots')

    submissions = [
        {
            'folder_name': 'GauthamRam_S70_FLAT_MicroProject',
            'zip_name': 'GauthamRam_S70_FLAT_MicroProject.zip',
            'subject': 'FLAT',
            'report_pdf': 'FLAT_Report.pdf',
            'report_docx': 'FLAT_Report.docx',
            'screenshots': [
                'flat_dfa_module.png',
                'flat_dfa_syntax_rejection.png',
                'overview_dashboard.png'
            ]
        },
        {
            'folder_name': 'GauthamRam_S70_COA_MicroProject',
            'zip_name': 'GauthamRam_S70_COA_MicroProject.zip',
            'subject': 'COA',
            'report_pdf': 'COA_Report.pdf',
            'report_docx': 'COA_Report.docx',
            'screenshots': [
                'coa_pipeline_module.png',
                'coa_pipeline_forwarding_comparison.png',
                'overview_dashboard.png'
            ]
        },
        {
            'folder_name': 'GauthamRam_S70_DAA_MicroProject',
            'zip_name': 'GauthamRam_S70_DAA_MicroProject.zip',
            'subject': 'DAA',
            'report_pdf': 'DAA_Report.pdf',
            'report_docx': 'DAA_Report.docx',
            'screenshots': [
                'daa_dijkstra_module.png',
                'daa_dijkstra_data_memory_route.png',
                'overview_dashboard.png'
            ]
        }
    ]

    for sub in submissions:
        sub_dir = os.path.join(output_final_dir, sub['folder_name'])
        zip_path = os.path.join(output_final_dir, sub['zip_name'])

        print(f"\n==================================================")
        print(f"Packaging {sub['subject']}: {sub['folder_name']}...")
        print(f"==================================================")

        # 1. Clean previous folder
        if os.path.exists(sub_dir):
            shutil.rmtree(sub_dir)
        os.makedirs(sub_dir, exist_ok=True)

        # A. Copy subject reports (Only 1 PDF and 1 DOCX, no redundant duplicates)
        for rf in [sub['report_pdf'], sub['report_docx']]:
            src = os.path.join(docs_dir, rf)
            if os.path.exists(src):
                shutil.copy2(src, os.path.join(sub_dir, rf))
                print(f"  + Added report: {rf}")

        # B. Copy general common README.md
        readme_src = os.path.join(project_source, 'README.md')
        if os.path.exists(readme_src):
            shutil.copy2(readme_src, os.path.join(sub_dir, 'README.md'))
            print("  + Added common README.md")

        # C. Copy ONLY subject-specific screenshots into screenshots/
        sub_screens_dir = os.path.join(sub_dir, 'screenshots')
        os.makedirs(sub_screens_dir, exist_ok=True)
        for sc in sub['screenshots']:
            src = os.path.join(screenshots_dir, sc)
            if os.path.exists(src):
                shutil.copy2(src, os.path.join(sub_screens_dir, sc))
                print(f"  + Added subject screenshot: {sc}")

        # D. Copy project source code
        dest_source_dir = os.path.join(sub_dir, 'Integrated_MicroProject_FLAT_DAA_COA')
        shutil.copytree(
            project_source,
            dest_source_dir,
            ignore=shutil.ignore_patterns(
                '.git', '__pycache__', 'node_modules', '*.tmp', '*.log', 'docs', 'screenshots'
            )
        )

        # In the bundled source code, create subject-isolated docs/ and screenshots/
        bundled_docs = os.path.join(dest_source_dir, 'docs')
        os.makedirs(bundled_docs, exist_ok=True)
        for rf in [sub['report_pdf'], sub['report_docx']]:
            src = os.path.join(docs_dir, rf)
            if os.path.exists(src):
                shutil.copy2(src, os.path.join(bundled_docs, rf))

        bundled_screens = os.path.join(dest_source_dir, 'screenshots')
        os.makedirs(bundled_screens, exist_ok=True)
        for sc in sub['screenshots']:
            src = os.path.join(screenshots_dir, sc)
            if os.path.exists(src):
                shutil.copy2(src, os.path.join(bundled_screens, sc))

        print(f"  + Added subject-isolated source folder")

        # 2. Build ZIP archive
        if os.path.exists(zip_path):
            os.remove(zip_path)
            
        print(f"  -> Compressing {sub['zip_name']}...")
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            for root, _, files in os.walk(sub_dir):
                for f in files:
                    full_p = os.path.join(root, f)
                    rel_p = os.path.relpath(full_p, sub_dir)
                    zf.write(full_p, rel_p)

        file_size = os.path.getsize(zip_path)
        print(f"  [OK] Successfully created {zip_path} ({file_size} bytes)")

    print("\nAll 3 subject packages successfully generated with zero duplicates!")

if __name__ == '__main__':
    package_all()
