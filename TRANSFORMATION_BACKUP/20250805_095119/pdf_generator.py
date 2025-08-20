#!/usr/bin/env python3
"""
Professional CV to PDF Generator
Converts HTML CV to high-quality PDF with advanced features
"""

import os
import sys
from pathlib import Path
from datetime import datetime

try:
    from weasyprint import HTML, CSS
    from weasyprint.text.fonts import FontConfiguration
except ImportError:
    print("Installing required dependencies...")
    os.system(f"{sys.executable} -m pip install weasyprint")
    from weasyprint import HTML, CSS
    from weasyprint.text.fonts import FontConfiguration

try:
    from PyPDF2 import PdfReader, PdfWriter
except ImportError:
    print("Installing PyPDF2 for PDF optimization...")
    os.system(f"{sys.executable} -m pip install PyPDF2")
    from PyPDF2 import PdfReader, PdfWriter


class CVPDFGenerator:
    """Professional CV to PDF converter with optimization features"""
    
    def __init__(self, input_html_path, output_pdf_path=None):
        self.input_path = Path(input_html_path)
        self.output_path = output_pdf_path or self.input_path.with_suffix('.pdf')
        
        # Ensure input file exists
        if not self.input_path.exists():
            raise FileNotFoundError(f"HTML file not found: {self.input_path}")
    
    def generate_pdf(self, optimize=True):
        """Generate PDF from HTML with advanced options"""
        print(f"🚀 Generating PDF from: {self.input_path}")
        
        # Font configuration for better typography
        font_config = FontConfiguration()
        
        # Custom CSS for PDF generation
        pdf_css = CSS(string='''
            @page {
                size: A4;
                margin: 0.5in 0.4in;
                @bottom-center {
                    content: "Page " counter(page) " of " counter(pages);
                    font-size: 10pt;
                    color: #7f8c8d;
                    font-family: Inter, Arial, sans-serif;
                }
            }
            
            /* Ensure backgrounds print */
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
            }
            
            /* Force page breaks */
            .section {
                page-break-inside: avoid;
            }
            
            .experience-item,
            .achievement-card,
            .project-item,
            .education-item {
                page-break-inside: avoid;
            }
            
            /* Hide screen-only elements */
            .pdf-controls {
                display: none !important;
            }
            
            /* Optimize fonts for PDF */
            body {
                font-size: 11pt;
                line-height: 1.4;
            }
            
            /* Ensure proper rendering of gradients */
            .header {
                background: #1e3c72 !important;
                background-image: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%) !important;
            }
        ''', font_config=font_config)
        
        # Read and process HTML
        with open(self.input_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Generate PDF
        html = HTML(string=html_content, base_url=str(self.input_path.parent))
        pdf_document = html.write_pdf(
            stylesheets=[pdf_css],
            font_config=font_config,
            optimize_size=('fonts', 'images'),
            jpeg_quality=95,
            pdf_version='1.7'
        )
        
        # Save initial PDF
        temp_path = self.output_path.with_suffix('.temp.pdf')
        with open(temp_path, 'wb') as f:
            f.write(pdf_document)
        
        if optimize:
            self._optimize_pdf(temp_path, self.output_path)
            temp_path.unlink()  # Remove temp file
        else:
            temp_path.rename(self.output_path)
        
        print(f"✅ PDF generated successfully: {self.output_path}")
        print(f"📊 File size: {self._get_file_size(self.output_path)}")
        
        return self.output_path
    
    def _optimize_pdf(self, input_path, output_path):
        """Optimize PDF for smaller file size while maintaining quality"""
        print("🔧 Optimizing PDF...")
        
        reader = PdfReader(str(input_path))
        writer = PdfWriter()
        
        # Copy all pages with compression
        for page in reader.pages:
            page.compress_content_streams()
            writer.add_page(page)
        
        # Add metadata
        writer.add_metadata({
            '/Title': 'Dr. Mohamed El Fadil - Healthcare Innovation Leader',
            '/Author': 'Dr. Mohamed El Fadil',
            '/Subject': 'Professional CV/Resume',
            '/Keywords': 'Healthcare, AI, Innovation, FHIR, HL7, Python, PyPI',
            '/Creator': 'BrainSAIT CV Generator',
            '/Producer': 'WeasyPrint with PyPDF2',
            '/CreationDate': datetime.now().strftime("D:%Y%m%d%H%M%S")
        })
        
        # Write optimized PDF
        with open(output_path, 'wb') as output_file:
            writer.write(output_file)
    
    def _get_file_size(self, file_path):
        """Get human-readable file size"""
        size = file_path.stat().st_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.2f} {unit}"
            size /= 1024.0
        return f"{size:.2f} TB"
    
    def batch_generate(self, formats=['pdf', 'pdf-compressed']):
        """Generate multiple PDF versions"""
        results = {}
        
        for format_type in formats:
            if format_type == 'pdf':
                output_path = self.output_path.with_name(f"{self.output_path.stem}_standard.pdf")
                results['standard'] = self.generate_pdf(optimize=False)
            elif format_type == 'pdf-compressed':
                output_path = self.output_path.with_name(f"{self.output_path.stem}_optimized.pdf")
                self.output_path = output_path
                results['optimized'] = self.generate_pdf(optimize=True)
        
        return results


def main():
    """Command-line interface for PDF generation"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Convert HTML CV to professional PDF',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python pdf_generator.py cv.html
  python pdf_generator.py cv.html -o resume.pdf
  python pdf_generator.py cv.html --no-optimize
  python pdf_generator.py cv.html --batch
        """
    )
    
    parser.add_argument('input', help='Input HTML file path')
    parser.add_argument('-o', '--output', help='Output PDF file path')
    parser.add_argument('--no-optimize', action='store_true', 
                      help='Skip PDF optimization')
    parser.add_argument('--batch', action='store_true',
                      help='Generate multiple PDF versions')
    
    args = parser.parse_args()
    
    try:
        generator = CVPDFGenerator(args.input, args.output)
        
        if args.batch:
            print("📦 Batch PDF generation mode")
            results = generator.batch_generate()
            print("\n✨ Generated PDFs:")
            for version, path in results.items():
                print(f"  - {version}: {path}")
        else:
            generator.generate_pdf(optimize=not args.no_optimize)
            
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    # Check if WeasyPrint dependencies are satisfied
    try:
        import weasyprint
    except ImportError as e:
        print("""
⚠️  WeasyPrint requires additional system dependencies:

For macOS:
  brew install python3 cairo pango gdk-pixbuf libffi

For Ubuntu/Debian:
  sudo apt-get install python3-pip python3-cffi python3-brotli libpango-1.0-0 libharfbuzz0b libpangoft2-1.0-0

For Windows:
  Download and install GTK3 runtime from: https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer

After installing system dependencies, run:
  pip install weasyprint
        """)
        sys.exit(1)
    
    main()