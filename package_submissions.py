"""
package_submissions.py - Packages the 3 subject-specific submission folders and ZIP files
in /output_final according to output_instruction.md and user specifications.

Ensures strict subject separation:
- FLAT package contains ONLY FLAT screenshots, FLAT report (.pdf and .docx), README.md, and project source.
- COA package contains ONLY COA screenshots, COA report (.pdf and .docx), README.md, and project source.
- DAA package contains ONLY DAA screenshots, DAA report (.pdf and .docx), README.md, and project source.
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
            'report_files': [
                'FLAT_Report.pdf',
                'FLAT_Report_GauthamRamS.pdf',
                'FLAT_Report.docx'
            ],
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
            'report_files': [
                'COA_Report.pdf',
                'COA_Report_GauthamRamS.pdf',
                'COA_Report.docx'
            ],
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
            'report_files': [
                'DAA_Report.pdf',
                'DAA_Report_GauthamRamS.pdf',
                'DAA_Report.docx'
            ],
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

        # 1. Clean and rebuild folder structure
        if os.path.exists(sub_dir):
            shutil.rmtree(sub_dir)
        os.makedirs(sub_dir, exist_ok=True)

        # A. Copy subject reports
        for rf in sub['report_files']:
            src = os.path.join(docs_dir, rf)
            if os.path.exists(src):
                shutil.copy2(src, os.path.join(sub_dir, rf))
                print(f"  + Added report: {rf}")

        # B. Copy general common README.md
        readme_src = os.path.join(project_source, 'README.md')
        if os.path.exists(readme_src):
            shutil.copy2(readme_src, os.path.join(sub_dir, 'README.md'))
            print("  + Added common README.md")

        # C. Copy ONLY subject-specific screenshots
        sub_screens_dir = os.path.join(sub_dir, 'screenshots')
        os.makedirs(sub_screens_dir, exist_ok=True)
        for sc in sub['screenshots']:
            src = os.path.join(screenshots_dir, sc)
            if os.path.exists(src):
                shutil.copy2(src, os.path.join(sub_screens_dir, sc))
                print(f"  + Added subject screenshot: {sc}")

        # D. Copy complete project source code folder (excluding git/temp/cache)
        dest_source_dir = os.path.join(sub_dir, 'Integrated_MicroProject_FLAT_DAA_COA')
        shutil.copytree(
            project_source,
            dest_source_dir,
            ignore=shutil.ignore_patterns(
                '.git', '__pycache__', 'node_modules', '*.tmp', '*.log'
            )
        )
        print("  + Added clean Integrated_MicroProject_FLAT_DAA_COA source")

        # 2. Build ZIP archive
        print(f"  -> Compressing {sub['zip_name']}...")
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
            for root, _, files in os.walk(sub_dir):
                for f in files:
                    full_p = os.path.join(root, f)
                    rel_p = os.path.relpath(full_p, sub_dir)
                    zf.write(full_p, rel_p)

        file_size = os.path.getsize(zip_path)
        print(f"  [OK] Successfully created {zip_path} ({file_size} bytes)")

    print("\nAll 3 subject packages successfully generated in output_final/!")

if __name__ == '__main__':
    package_all()
